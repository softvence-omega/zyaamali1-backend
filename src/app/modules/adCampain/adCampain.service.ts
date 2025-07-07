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