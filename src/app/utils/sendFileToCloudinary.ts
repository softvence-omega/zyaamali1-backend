// import {
//   UploadApiErrorResponse,
//   UploadApiResponse,
//   v2 as cloudinary,
// } from "cloudinary";
// import config from "../config";
// import multer from "multer";
// import fs from "fs"; // node js built in module, not third party

// cloudinary.config({
//   cloud_name: config.cloudinary_cloud_name,
//   api_key: config.cloudinary_api_key,
//   api_secret: config.cloudinary_api_secret,
// });

// export const sendFileToCloudinary = (
//   fileName: string,
//   path: string,
//   type?: string
// ) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       // Uploads File to the uploads folder temporarily
//       path,
//       { public_id: fileName, resource_type: type == "image" ? "auto" : "raw" },
//       function (error, result) {
//         if (error) {
//           reject(error as UploadApiErrorResponse);
//         }
//         resolve(result as UploadApiResponse);

//         // unlink (delete) the file that was uploaded in uploads folder after resolved
//         fs.unlink(path, (err) => {
//           if (err) {
//             console.log(err);
//           } else {
//             console.log("File is deleted.");
//           }
//         });
//       }
//     );
//   });
// };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, process.cwd() + "/uploads"); // multer uploads the file to the uploads destination
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix); // Creating an unique name for the image using Date()
//   },
// });

// export const upload = multer({ storage: storage });
// // Cloudinary is like imgBB, an image hosting platform
// // multer is used for file data parsing or accepting form-data inputs like image


import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import config from "../config";
import multer from "multer";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key:    config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

/**
 * Upload a local file to Cloudinary (image / video / raw).
 *
 * @param fileName   Desired public_id in Cloudinary.
 * @param localPath  Full path to the temporary file.
 * @param mimeType   Original MIME type (e.g. "image/png", "video/mp4").
 */
export const sendFileToCloudinary = (
  fileName: string,
  localPath: string,
  mimeType: string
): Promise<UploadApiResponse> => {
  // Decide the Cloudinary resource type
  const resourceType = mimeType.startsWith("video/")
    ? "video"
    : mimeType.startsWith("image/")
    ? "image"
    : "raw";

  // For videos use upload_large (chunked); for others regular upload
  const uploader =
    resourceType === "video"
      ? cloudinary.uploader.upload_large
      : cloudinary.uploader.upload;

  return new Promise((resolve, reject) => {
    uploader(
      localPath,
      { public_id: fileName, resource_type: resourceType },
      (error, result) => {
        // Always delete the temp file
        fs.unlink(localPath, () => {});

        if (error) {
          return reject(error as UploadApiErrorResponse);
        }
        resolve(result as UploadApiResponse);
      }
    );
  });
};

/* ---------- Multer config ---------- */

// Destination: ./uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

// Accept common image & video types; limit size to 200 MB (adjust as needed)
const allowed = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Unsupported file type"));
  },
});
