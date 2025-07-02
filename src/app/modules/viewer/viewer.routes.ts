
import express from "express";
import { viewerController } from "./viewer.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { viewerUpdateValidation } from "./viewer.validation";

const router = express.Router();

router.post("/post_viewer", viewerController.postViewer);
router.get("/get_all_viewer", viewerController.getAllViewer);
router.get("/get_single_viewer/:id", viewerController.getSingleViewer);
router.patch(
    "/update_viewer/:id",
    viewerController.updateViewer
); 
router.delete("/delete_viewer/:id", viewerController.deleteViewer);

export const viewerRoutes = router;