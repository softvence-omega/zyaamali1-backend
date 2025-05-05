const path = require("path");
const fs = require("fs");

const moduleName = process.argv[2];
if (!moduleName) {
  console.error("Please provide a module name");
  process.exit(1);
}

const modulePath = path.join(
  __dirname,
  "..",
  "src",
  "app",
  "modules",
  moduleName
);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const files = {
  [`${moduleName}.routes.ts`]: `
    import express from "express";
    import { validateRequest } from "../../middlewares/validateRequest";
    import { ${moduleName}Controller } from "./${moduleName}.controller";
    import { ${moduleName}PostValidation,${moduleName}UpdateValidation } from "./${moduleName}.validation";

    const router = express.Router();
    
    router.post("/post_${moduleName}", validateRequest(${moduleName}PostValidation), ${moduleName}Controller.post${capitalizeFirstLetter(
    moduleName
  )});
    router.get("/get_all_${moduleName}", ${moduleName}Controller.getAll${capitalizeFirstLetter(
    moduleName
  )});
    router.get("/get_single_${moduleName}/:id", ${moduleName}Controller.getSingle${capitalizeFirstLetter(
    moduleName
  )});
    router.put("/update_${moduleName}/:id", validateRequest(${moduleName}UpdateValidation), ${moduleName}Controller.update${capitalizeFirstLetter(
    moduleName
  )});
    router.delete("/delete_${moduleName}/:id", ${moduleName}Controller.delete${capitalizeFirstLetter(
    moduleName
  )});
    
    export const ${moduleName}Routes = router;`,

  [`${moduleName}.controller.ts`]: `import { Request, Response } from "express";
    import { ${moduleName}Service } from "./${moduleName}.service";
    import catchAsync from "../../utils/catchAsync";
    import sendResponse from "../../utils/sendResponse";
    import status from "http-status";
    
    const post${capitalizeFirstLetter(
      moduleName
    )} = catchAsync(async (req: Request, res: Response) => {
      const result = await ${moduleName}Service.post${capitalizeFirstLetter(
    moduleName
  )}IntoDB(req.body);
      sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
    });
    
    const getAll${capitalizeFirstLetter(
      moduleName
    )} = catchAsync(async (req: Request, res: Response) => {
      const result = await ${moduleName}Service.getAll${capitalizeFirstLetter(
    moduleName
  )}FromDB(req.query);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
    });
    
    const getSingle${capitalizeFirstLetter(
      moduleName
    )} = catchAsync(async (req: Request, res: Response) => {
      const result = await ${moduleName}Service.getSingle${capitalizeFirstLetter(
    moduleName
  )}FromDB(req.params.id);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
    });
    
    const update${capitalizeFirstLetter(
      moduleName
    )} = catchAsync(async (req: Request, res: Response) => {
      const result = await ${moduleName}Service.update${capitalizeFirstLetter(
    moduleName
  )}IntoDB(req.body);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
    });
    
    const delete${capitalizeFirstLetter(
      moduleName
    )} = catchAsync(async (req: Request, res: Response) => {
      await ${moduleName}Service.delete${capitalizeFirstLetter(
    moduleName
  )}FromDB(req.params.id);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully",data: null });
    });

    
    export const ${moduleName}Controller = { post${capitalizeFirstLetter(
    moduleName
  )}, getAll${capitalizeFirstLetter(
    moduleName
  )}, getSingle${capitalizeFirstLetter(
    moduleName
  )}, update${capitalizeFirstLetter(moduleName)}, delete${capitalizeFirstLetter(
    moduleName
  )} };
    `,

  [`${moduleName}.service.ts`]: `import { ${moduleName}Model } from "./${moduleName}.model";
      import { ${moduleName.toUpperCase()}_SEARCHABLE_FIELDS } from "./${moduleName}.constant";
    import QueryBuilder from "../../builder/QueryBuilder";
    import status from "http-status";
    import AppError from "../../errors/AppError";
    




    export const ${moduleName}Service = {
      async post${capitalizeFirstLetter(moduleName)}IntoDB(data: any) {
      try {
        return await ${moduleName}Model.create(data);
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(\`\${error.message}\`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async getAll${capitalizeFirstLetter(moduleName)}FromDB(query: any) {
      try {
    
    
      const service_query = new QueryBuilder(${moduleName}Model.find(), query)
            .search(${moduleName.toUpperCase()}_SEARCHABLE_FIELDS)
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
            throw new Error(\`\${error.message}\`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async getSingle${capitalizeFirstLetter(moduleName)}FromDB(id: string) {
        try {
        return await ${moduleName}Model.findById(id);
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(\`\${error.message}\`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async update${capitalizeFirstLetter(moduleName)}IntoDB(data: any) {
      try {
    
    
    
      const isDeleted = await ${moduleName}Model.findOne({ _id: data.id });
        if (isDeleted?.isDelete) {
          throw new AppError(status.NOT_FOUND, "${moduleName} is already deleted");
        }
    
        const result = await ${moduleName}Model.updateOne({ _id: data.id }, data, {
          new: true,
        });
        if (!result) {
          throw new Error("${moduleName} not found.");
        }
        return result;
    
    
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(\`\${error.message}\`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async delete${capitalizeFirstLetter(moduleName)}FromDB(id: string) {
        try {
    
    
     // Step 1: Check if the ${moduleName} exists in the database
        const isExist = await ${moduleName}Model.findOne({ _id: id });
    
        if (!isExist) {
          throw new AppError(status.NOT_FOUND, "${moduleName} not found");
        }
    
        // Step 4: Delete the home ${moduleName} from the database
        await ${moduleName}Model.updateOne({ _id: id }, { isDelete: true });
        return;
    
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(\`\${error.message}\`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
    };`,

  [`${moduleName}.model.ts`]: `import mongoose from "mongoose";
    
    const ${moduleName}Schema = new mongoose.Schema({
    
     isDelete: {
            type: Boolean,
            default: false,
        }}, { timestamps: true });
    
    export const ${moduleName}Model = mongoose.model("${moduleName}", ${moduleName}Schema);`,

  [`${moduleName}.interface.ts`]: `export interface I${moduleName} {}`,

  [`${moduleName}.validation.ts`]: `import { z } from 'zod';
    
    export const ${moduleName}PostValidation = z.object({
      // Example field (you can adjust based on your model)
      name: z.string().min(1, { message: "Name is required" }),
      // Add other fields based on your model's needs
    });
    
    
    export const ${moduleName}UpdateValidation = ${moduleName}PostValidation.partial();
    `,

  [`${moduleName}.constant.ts`]: `export const ${moduleName.toUpperCase()}_SEARCHABLE_FIELDS = [];`,
};

// create module folder if not exists:
if (!fs.existsSync(modulePath)) {
  fs.mkdirSync(modulePath, { recursive: true });
}
// create files in module folder
Object.entries(files).forEach(([file, content]) => {
  const filePath = path.join(modulePath, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created: ${filePath}`);
  } else {
    console.log(`❌ File already exists: ${filePath}`);
  }
});

console.log(`🎉 ${moduleName} module generated successfully!`);
