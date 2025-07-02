import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { Business } from "./business.model";
import { TUser } from "../user/user.interface";
import { User } from "../user/user.model";

const addBusiness = async (payload: any) => {
    // console.log("Adding business with payload:", payload);

    // Check if a business with the same name already exists for the user

    const isUserExists = await User.findOne({
        _id: payload.createdBy,
    })

    // console.log(isUserExists);

    if (!isUserExists) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "User not found with this id"
        )
    }



    const isBusinessExists = await Business.findOne({
        name: payload.name,
        isDeleted: false,
        createdBy: payload.createdBy,
    });
    // console.log("Business exists:", isBusinessExists);
    if (isBusinessExists) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Business already exists with this name")
    }
    // Added A Bussiness

    const result = await Business.create(payload)
    return result

}

const getAllBusiness = async () => {
    // console.log("Fetching all businesses for user:", userId);
    const result = await Business.find({ isDeleted: false }).populate("createdBy", "name email role");
    // console.log("Businesses found:", businesses);
    if (!result || result.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, "No businesses found");
    }
    return result;
}



const updateBusiness = async (id: string, payload: Partial<TUser>) => {
    // console.log("Fetching businesses for user:", userId);

    const isBusinessExists = await Business.findOne({
        _id: id,
        isDeleted: false
    });
    if (!isBusinessExists) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Business not found with this id"
        )
    }
    const result = await Business.findByIdAndUpdate(id, payload, { new: true });
    return result
}


const deleteBusiness = async (id: string) => {
    const isBusinessExists = await Business.findOne({
        _id: id,
        isDeleted: false
    });
    if (!isBusinessExists) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Business not found with this id"
        )
    }

    // console.log(isBusinessExists);
    const result = await Business.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return result
}
export const BusinessService = {
    addBusiness,
    getAllBusiness, updateBusiness, deleteBusiness
}