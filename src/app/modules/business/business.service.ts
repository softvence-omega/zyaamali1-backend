import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { Business } from "./business.model";
import { User } from "../user/user.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { BUSINESS_SEARCHABLE_FIELDS } from "./business.constant";

const addBusiness = async (payload: any) => {
    console.log(payload);
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


const getAllBusiness = async (createdBy:string,query: any) => {
    try {


        const service_query = new QueryBuilder(Business.find({ isDeleted: false , createdBy}).populate("createdBy", "name email role"), query)
            .search(BUSINESS_SEARCHABLE_FIELDS)
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
        if (error instanceof Error) {
            throw new Error(`${error.message}`);
        } else {
            throw new Error("An unknown error occurred while fetching by ID.");
        }
    }
}



const updateBusiness = async (createdBy:string,id: string, payload: any) => {
    console.log("Fetching businesses for user:", payload);

    const isBusinessExists = await Business.findOne({
        _id: id,
        isDeleted: false,
        createdBy
    });
    if (!isBusinessExists) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Business not found with this id"
        )
    }

    console.log(isBusinessExists);
    const result = await Business.findByIdAndUpdate(id, payload, { new: true });
    return result
}


const deleteBusiness = async (id: string, createdBy: string) => {
    const isBusinessExists = await Business.findOne({
        _id: id,
        isDeleted: false,
        createdBy
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