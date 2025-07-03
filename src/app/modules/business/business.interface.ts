import { Types } from "mongoose";

export type TBusiness = {
    name: string
    description: string
    goal: string
    createdBy:Types.ObjectId;
    isDeleted?: boolean;
};
