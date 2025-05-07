import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import config from "../config";
import multer from "multer";
import fs from "fs"; // node js built in module, not third party

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const sendFileToCloudinary = (
  fileName: string,
  path: string,
  type?: string
) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      // Uploads File to the uploads folder temporarily
      path,
      { public_id: fileName, resource_type: type == "image" ? "auto" : "raw" },
      function (error, result) {
        if (error) {
          reject(error as UploadApiErrorResponse);
        }
        resolve(result as UploadApiResponse);

        // unlink (delete) the file that was uploaded in uploads folder after resolved
        fs.unlink(path, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("File is deleted.");
          }
        });
      }
    );
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/uploads"); // multer uploads the file to the uploads destination
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix); // Creating an unique name for the image using Date()
  },
});

export const upload = multer({ storage: storage });
// Cloudinary is like imgBB, an image hosting platform
// multer is used for file data parsing or accepting form-data inputs like image
