import { adCampainModel } from "./adCampain.model";
      import { ADCAMPAIN_SEARCHABLE_FIELDS } from "./adCampain.constant";
    import QueryBuilder from "../../builder/QueryBuilder";
    import status from "http-status";
    import AppError from "../../errors/AppError";
    




    export const adCampainService = {
      async postAdCampainIntoDB(data: any) {
      try {
        return await adCampainModel.create(data);
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async getAllAdCampainFromDB(query: any) {
      try {
    
    
      const service_query = new QueryBuilder(adCampainModel.find(), query)
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
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async getSingleAdCampainFromDB(id: string) {
        try {
        return await adCampainModel.findById(id);
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async updateAdCampainIntoDB(data: any) {
      try {
    
    
    
      const isDeleted = await adCampainModel.findOne({ _id: data.id });
        if (isDeleted?.isDelete) {
          throw new AppError(status.NOT_FOUND, "adCampain is already deleted");
        }
    
        const result = await adCampainModel.updateOne({ _id: data.id }, data, {
          new: true,
        });
        if (!result) {
          throw new Error("adCampain not found.");
        }
        return result;
    
    
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async deleteAdCampainFromDB(id: string) {
        try {
    
    
     // Step 1: Check if the adCampain exists in the database
        const isExist = await adCampainModel.findOne({ _id: id });
    
        if (!isExist) {
          throw new AppError(status.NOT_FOUND, "adCampain not found");
        }
    
        // Step 4: Delete the home adCampain from the database
        await adCampainModel.updateOne({ _id: id }, { isDelete: true });
        return;
    
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
    };