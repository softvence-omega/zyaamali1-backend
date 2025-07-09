import { ADCAMPAIN_SEARCHABLE_FIELDS } from "./adCampain.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import { adCampainModel } from "./adCampain.model";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { User } from "../user/user.model";





export const adCampainService = {


  async postAdCampainIntoDB(data: any) {
    try {

      // // Check if a campaign with the same title already exists
      // const isExist = await adCampainModel.findOne({ title: data.title,  });

      // if (isExist) {
      //   throw new ApiError(httpStatus.CONFLICT, 'Ad campaign with this title already exists.');
      // }

      // Create and save the new campaign
      const result = await adCampainModel.create(data);
      return result;
    } catch (error: unknown) {
      throw error;
    }
  },


  async getAllAdCampainFromDB(query: any, createdBy: any) {
    try {

      // step- 1 : Find login user:

      const loginUser = await User.findById(createdBy);


      if (!loginUser) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

      let teamUserIds: string[] = [];

      if (loginUser.role === "admin") {
        // step 2a: admin - include all users they created + self
        const teamMembers = await User.find({ createdBy: loginUser._id });
        teamUserIds = teamMembers.map((u) => u._id.toString())
        teamUserIds.push(loginUser._id.toString());
      } else {

        // step 2b: creator/viewer - get their admin
        const adminUser = await User.findById(loginUser.createdBy);
        if (adminUser) {
          const teamMembers = await User.find({ createdBy: adminUser._id })
          teamUserIds = teamMembers.map((u) => u._id.toString());
          teamUserIds.push(loginUser._id.toString())
        }
        // else{
        //   // Fallback : show only own campaign
        //   teamUserIds = [loginUser._id.toString()];
        // }
      }



      const service_query = new QueryBuilder(adCampainModel.find({ createdBy: { $in: teamUserIds }, isDeleted: false }), query)
        .search(ADCAMPAIN_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await service_query.modelQuery;
      const meta = await service_query.countTotal();
      return {
        result,
        meta,
      };

    } catch (error: unknown) {
      throw error;
    }
  },
  async getSingleAdCampainFromDB(id: string) {
    try {
      return await adCampainModel.findById(id);
    } catch (error: unknown) {
      throw error;
    }
  },
 

  async getAdDashboardSummary(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    const teamAdminId = user.role === 'admin' ? user._id : user.createdBy || null;

    const result = await adCampainModel.aggregate([
      {
        $match: {
          isDeleted: false,
          status: 'ACTIVE'
        }
      },

      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: '$creator' },

      {
        $match: {
          $or: [
            { 'creator._id': user._id },
            { 'creator._id': teamAdminId },
            { 'creator.createdBy': teamAdminId }
          ]
        }
      },

      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalImpressions: { $sum: { $ifNull: ['$stats.impressions', 0] } },
          totalReach: { $sum: { $ifNull: ['$stats.reach', 0] } },
          totalEngagement: { $sum: { $ifNull: ['$stats.clicks', 0] } },
          totalConversions: { $sum: { $ifNull: ['$stats.conversions', 0] } },
          totalRevenue: { $sum: { $ifNull: ['$stats.revenue', 0] } }, // ✅ revenue from DB
          totalBudget: { $sum: { $ifNull: ['$budget.total', 0] } },
          totalSpend: {
            $sum: {
              $round: [
                {
                  $multiply: [
                    { $ifNull: ['$stats.clicks', 0] },
                    { $ifNull: ['$budget.costPerClick', 0] }
                  ]
                },
                2
              ]
            }
          },
          dailySpend: { $sum: { $ifNull: ['$budget.daily', 0] } }
        }
      },

      {
        $project: {
          _id: 0,
          activeCampaigns: '$totalCampaigns',

          // ✅ ROAS (ROI Percent)
          roiPercent: {
            $cond: [
              { $gt: ['$totalSpend', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalRevenue', '$totalSpend'] },
                      100
                    ]
                  },
                  2
                ]
              },
              0
            ]
          },

          impressions: '$totalImpressions',
          reach: '$totalReach',

          // ✅ Conversion Rate from Impressions
          impressionsRoiPercent: {
            $cond: [
              { $gt: ['$totalImpressions', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalConversions', '$totalImpressions'] },
                      100
                    ]
                  },
                  1
                ]
              },
              0
            ]
          },

          // ✅ Engagement Rate = CTR
          engagement: '$totalEngagement',
          ctrPercent: {
            $cond: [
              { $gt: ['$totalImpressions', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalEngagement', '$totalImpressions'] },
                      100
                    ]
                  },
                  1
                ]
              },
              0
            ]
          },

          totalBudget: 1,
          totalSpend: 1,
          dailySpend: 1
        }
      }
    ]);

    // fallback
    return result[0] || {
      activeCampaigns: 0,
      roiPercent: 0,
      impressions: 0,
      reach: 0,
      impressionsRoiPercent: 0,
      engagement: 0,
      ctrPercent: 0,
      totalBudget: 0,
      totalSpend: 0,
      dailySpend: 0
    };
  }
  ,



  async getActiveCampaignsTableFromDB(userId: string) {

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }


    const allActiveCampaigns = await adCampainModel
      .find({ isDeleted: false, status: 'ACTIVE' })
      .populate('createdBy');


    const teamAdminId =
      user.role === 'admin' ? user._id : user.createdBy || null;

    const visibleCampaigns = allActiveCampaigns.filter(campaign => {
      if (user.role === 'superAdmin') return true;

      const owner: any = campaign.createdBy;
      if (!owner) return false;

      return (
        owner._id.toString() === user._id.toString() ||
        owner._id.toString() === teamAdminId?.toString() ||
        owner.createdBy?.toString() === teamAdminId?.toString()
      );
    });

    console.log({ visibleCampaigns });


    const table = await adCampainModel.aggregate([
      // Step 1
      { $match: { isDeleted: false, status: 'ACTIVE' } },

      // Step 2
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
        }
      },
      { $unwind: '$creator' },

      // Step 3
      {
        $match: {
          $or: [
            { 'creator._id': user._id },
            { 'creator._id': teamAdminId },
            { 'creator.createdBy': teamAdminId }
          ]
        }
      },

      // Step 4
      {
        $group: {
          _id: '$platform',
          impressions: { $sum: { $ifNull: ['$stats.impressions', 0] } },
          clicks: { $sum: { $ifNull: ['$stats.clicks', 0] } },
          conversions: { $sum: { $ifNull: ['$stats.conversions', 0] } },
          budget: { $sum: { $ifNull: ['$budget.total', 0] } },
          costPerClick: { $avg: { $ifNull: ['$budget.costPerClick', 0] } }, // 🔥 Add this
        }
      }
      ,

      // Step 5
      {
        $addFields: {
          ctr: {
            $cond: [
              { $gt: ['$impressions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] }, 1] },
              0
            ]
          },
          spend: {
            $round: [{ $multiply: ['$clicks', '$costPerClick'] }, 2]  // 👍 Spend = clicks × costPerClick
          },
          platform: '$_id'
        }
      },


      // Step 6:
      {
        $project: {
          _id: 0,
          platform: 1,
          impressions: 1,
          clicks: 1,
          conversions: 1,
          budget: 1,
          ctr: 1,
          spend: 1,
          roas: { $ifNull: ['$stats.roas', 0] }
        }
      }

      ,

      // Step 7
      {
        $sort: { impressions: -1 }
      }
    ]);

    return table;

  },

  async getActiveAndInactiveCampaignsTableFromDB(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    const teamAdminId = user.role === 'admin' ? user._id : user.createdBy || null;

    const table = await adCampainModel.aggregate([
      { $match: { isDeleted: false, status: { $in: ['ACTIVE', 'INACTIVE'] } } },

      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
        }
      },
      { $unwind: '$creator' },

      {
        $match: {
          $or: [
            { 'creator._id': user._id },
            { 'creator._id': teamAdminId },
            { 'creator.createdBy': teamAdminId }
          ]
        }
      },

      {
        $group: {
          _id: { platform: '$platform', status: '$status' },
          impressions: { $sum: { $ifNull: ['$stats.impressions', 0] } },
          clicks: { $sum: { $ifNull: ['$stats.clicks', 0] } },
          conversions: { $sum: { $ifNull: ['$stats.conversions', 0] } },
          budget: { $sum: { $ifNull: ['$budget.total', 0] } },
          costPerClick: { $avg: { $ifNull: ['$budget.costPerClick', 0] } },

          totalRevenue: { $sum: { $ifNull: ['$stats.revenue', 0] } },
          totalSpend: {
            $sum: {
              $multiply: [
                { $ifNull: ['$stats.clicks', 0] },
                { $ifNull: ['$budget.costPerClick', 0] }
              ]
            }
          },
        }
      },

      {
        $addFields: {
          ctr: {
            $cond: [
              { $gt: ['$impressions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] }, 1] },
              0
            ]
          },
          spend: { $round: ['$totalSpend', 2] },
          roas: {
            $cond: [
              { $gt: ['$totalSpend', 0] },
              { $round: [{ $divide: ['$totalRevenue', '$totalSpend'] }, 2] },
              0
            ]
          },
          platform: '$_id.platform',
          status: '$_id.status',
        }
      },

      {
        $project: {
          _id: 0,
          platform: 1,
          status: 1,
          impressions: 1,
          clicks: 1,
          conversions: 1,
          budget: 1,
          ctr: 1,
          spend: 1,
          roas: 1,
        }
      },

      {
        $sort: { impressions: -1 }
      }
    ]);

    const total = table.reduce(
      (acc, item) => {
        acc.impressions += item.impressions || 0;
        acc.clicks += item.clicks || 0;
        acc.conversions += item.conversions || 0;
        acc.spend += item.spend || 0;
        acc.roas += item.roas || 0;
        return acc;
      },
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, roas: 0 }
    );

    const totalCTR =
      total.impressions > 0
        ? Number(((total.clicks / total.impressions) * 100).toFixed(1))
        : 0;

    const totalROAS =
      table.length > 0
        ? Number((total.roas / table.length).toFixed(2))
        : 0;

    return {
      table,
      summary: {
        impressions: total.impressions,
        clicks: total.clicks,
        ctr: totalCTR,
        conversions: total.conversions,
        spend: Number(total.spend.toFixed(2)),
        roas: totalROAS,
      }
    };
  }
  ,

  async getActiveCampaignsFromDB(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    const teamAdminId = user.role === 'admin' ? user._id : user.createdBy || null;

    const table = await adCampainModel.aggregate([
      { $match: { isDeleted: false, status: "ACTIVE" } },

      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
        }
      },
      { $unwind: '$creator' },

      {
        $match: {
          $or: [
            { 'creator._id': user._id },
            { 'creator._id': teamAdminId },
            { 'creator.createdBy': teamAdminId }
          ]
        }
      },

      {
        $group: {
          _id: { platform: '$platform', status: '$status' },
          impressions: { $sum: { $ifNull: ['$stats.impressions', 0] } },
          clicks: { $sum: { $ifNull: ['$stats.clicks', 0] } },
          conversions: { $sum: { $ifNull: ['$stats.conversions', 0] } },
          budget: { $sum: { $ifNull: ['$budget.total', 0] } },
          costPerClick: { $avg: { $ifNull: ['$budget.costPerClick', 0] } },

          totalRevenue: { $sum: { $ifNull: ['$stats.revenue', 0] } },
          totalSpend: {
            $sum: {
              $multiply: [
                { $ifNull: ['$stats.clicks', 0] },
                { $ifNull: ['$budget.costPerClick', 0] }
              ]
            }
          },
        }
      },

      {
        $addFields: {
          ctr: {
            $cond: [
              { $gt: ['$impressions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] }, 1] },
              0
            ]
          },
          spend: { $round: ['$totalSpend', 2] },
          roas: {
            $cond: [
              { $gt: ['$totalSpend', 0] },
              { $round: [{ $divide: ['$totalRevenue', '$totalSpend'] }, 2] },
              0
            ]
          },
          platform: '$_id.platform',
          status: '$_id.status',
        }
      },

      {
        $project: {
          _id: 0,
          platform: 1,
          status: 1,
          impressions: 1,
          clicks: 1,
          conversions: 1,
          budget: 1,
          ctr: 1,
          spend: 1,
          roas: 1,
        }
      },

      {
        $sort: { impressions: -1 }
      }
    ]);

    
    

    return {
      table,
      
    };
  },
  async getInActiveCampaignsFromDB(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    const teamAdminId = user.role === 'admin' ? user._id : user.createdBy || null;

    const table = await adCampainModel.aggregate([
      { $match: { isDeleted: false, status: "INACTIVE" } },

      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
        }
      },
      { $unwind: '$creator' },

      {
        $match: {
          $or: [
            { 'creator._id': user._id },
            { 'creator._id': teamAdminId },
            { 'creator.createdBy': teamAdminId }
          ]
        }
      },

      {
        $group: {
          _id: { platform: '$platform', status: '$status' },
          impressions: { $sum: { $ifNull: ['$stats.impressions', 0] } },
          clicks: { $sum: { $ifNull: ['$stats.clicks', 0] } },
          conversions: { $sum: { $ifNull: ['$stats.conversions', 0] } },
          budget: { $sum: { $ifNull: ['$budget.total', 0] } },
          costPerClick: { $avg: { $ifNull: ['$budget.costPerClick', 0] } },

          totalRevenue: { $sum: { $ifNull: ['$stats.revenue', 0] } },
          totalSpend: {
            $sum: {
              $multiply: [
                { $ifNull: ['$stats.clicks', 0] },
                { $ifNull: ['$budget.costPerClick', 0] }
              ]
            }
          },
        }
      },

      {
        $addFields: {
          ctr: {
            $cond: [
              { $gt: ['$impressions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] }, 1] },
              0
            ]
          },
          spend: { $round: ['$totalSpend', 2] },
          roas: {
            $cond: [
              { $gt: ['$totalSpend', 0] },
              { $round: [{ $divide: ['$totalRevenue', '$totalSpend'] }, 2] },
              0
            ]
          },
          platform: '$_id.platform',
          status: '$_id.status',
        }
      },

      {
        $project: {
          _id: 0,
          platform: 1,
          status: 1,
          impressions: 1,
          clicks: 1,
          conversions: 1,
          budget: 1,
          ctr: 1,
          spend: 1,
          roas: 1,
        }
      },

      {
        $sort: { impressions: -1 }
      }
    ]);

    
    

    return {
      table,
      
    };
  },


  async getAlCampaignsPerformanceFromDB(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    const teamAdminId = user.role === 'admin' ? user._id : user.createdBy || null;

    const table = await adCampainModel.aggregate([
      { $match: { isDeleted: false } },

      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
        }
      },
      { $unwind: '$creator' },

      {
        $match: {
          $or: [
            { 'creator._id': user._id },
            { 'creator._id': teamAdminId },
            { 'creator.createdBy': teamAdminId }
          ]
        }
      },

      {
        $group: {
          _id: { platform: '$platform', status: '$status' },
          impressions: { $sum: { $ifNull: ['$stats.impressions', 0] } },
          clicks: { $sum: { $ifNull: ['$stats.clicks', 0] } },
          conversions: { $sum: { $ifNull: ['$stats.conversions', 0] } },
          budget: { $sum: { $ifNull: ['$budget.total', 0] } },
          costPerClick: { $avg: { $ifNull: ['$budget.costPerClick', 0] } },

          totalRevenue: { $sum: { $ifNull: ['$stats.revenue', 0] } },
          totalSpend: {
            $sum: {
              $multiply: [
                { $ifNull: ['$stats.clicks', 0] },
                { $ifNull: ['$budget.costPerClick', 0] }
              ]
            }
          },
        }
      },

      {
        $addFields: {
          ctr: {
            $cond: [
              { $gt: ['$impressions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] }, 1] },
              0
            ]
          },
          spend: { $round: ['$totalSpend', 2] },
          roas: {
            $cond: [
              { $gt: ['$totalSpend', 0] },
              { $round: [{ $divide: ['$totalRevenue', '$totalSpend'] }, 2] },
              0
            ]
          },
          platform: '$_id.platform',
          status: '$_id.status',
        }
      },

      {
        $project: {
          _id: 0,
          platform: 1,
          status: 1,
          impressions: 1,
          clicks: 1,
          conversions: 1,
          budget: 1,
          ctr: 1,
          spend: 1,
          roas: 1,
        }
      },

      {
        $sort: { impressions: -1 }
      }
    ]);

    
    

    return {
      table,
      
    };
  },





  async updateAdCampainIntoDB(payload: any, id: any) {
    try {
      const existingCampaign = await adCampainModel.findById(id);

      if (!existingCampaign) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Ad campaign not found');
      }

      if (existingCampaign.isDeleted) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'This campaign has been deleted');
      }

      const updatedCampaign = await adCampainModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });

      return updatedCampaign;

    } catch (error: unknown) {
      throw error;
    }
  },
  async deleteAdCampaignFromDB(id: string) {
    try {
      const existing = await adCampainModel.findById(id);

      if (!existing) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Ad campaign not found');
      }

      if (existing.isDeleted) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Ad campaign already deleted');
      }

      const deleted = await adCampainModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );

      return deleted;
    } catch (error) {
      throw error;
    }
  }
};