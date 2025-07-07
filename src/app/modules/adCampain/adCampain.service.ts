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


    if(!loginUser) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    let teamUserIds : string[] = [];

    if(loginUser.role === "admin"){
      // step 2a: admin - include all users they created + self
      const teamMembers = await User.find({createdBy: loginUser._id});
      teamUserIds = teamMembers.map((u) => u._id.toString())
      teamUserIds.push(loginUser._id.toString());
    }else{

      // step 2b: creator/viewer - get their admin
      const adminUser = await User.findById(loginUser.createdBy);
      if(adminUser){
        const teamMembers  = await User.find({createdBy: adminUser._id})
        teamUserIds = teamMembers.map((u) => u._id.toString());
        teamUserIds.push(loginUser._id.toString())
      }
      // else{
      //   // Fallback : show only own campaign
      //   teamUserIds = [loginUser._id.toString()];
      // }
    }



      const service_query = new QueryBuilder(adCampainModel.find({createdBy: {$in: teamUserIds}, isDeleted: false}), query)
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
  // async getAdCampainsInfoFromDB(userId: string) {

  //   const isUserExists = await User.findById(userId)
  //   console.log(isUserExists);

  //   if (!isUserExists) {
  //     throw new ApiError(status.NOT_FOUND, "Users not found!")
  //   }

  //   const result = await adCampainModel.find()
  //   return result

  // },


  async getAdDashboardSummary(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(status.NOT_FOUND, "User not found");

    // Step 1: Get all non-deleted campaigns + createdBy
    const allCampaigns = await adCampainModel
      .find({ isDeleted: false })
      .populate("createdBy");

    // Step 2: Get Team Admin ID for viewer/creator
    const teamAdminId =
      user.role === 'admin' ? user._id : user.createdBy || null;

    // Step 3: Filter Campaigns based on Role
    const campaigns = allCampaigns.filter((campaign: any) => {
      const owner = campaign.createdBy;
      if (!owner) return false;

      if (user.role === 'superAdmin') return true;

      return (
        owner._id.equals(user._id) ||
        owner._id.equals(teamAdminId) ||
        owner.createdBy?.equals(teamAdminId)
      );
    });

    // Step 4: Summary Calculations
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');

    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.stats?.impressions || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.stats?.clicks || 0), 0);
    const engagementRate = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;

    const totalDailyBudget = campaigns.reduce((sum, c) => sum + (c.budget?.daily || 0), 0);
    const averageDailyBudget = campaigns.length ? totalDailyBudget / campaigns.length : 0;

    const totalRoas = campaigns.reduce((sum, c) => sum + (c.stats?.roas || 0), 0);
    const roi = campaigns.length ? totalRoas / campaigns.length : 0;

    return {
      activeCampaignsCount: activeCampaigns.length,
      totalImpressions,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      averageDailyBudget: parseFloat(averageDailyBudget.toFixed(2)),
      roi: parseFloat(roi.toFixed(2))
    };
  }



  ,

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