
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
    validateRequest(viewerUpdateValidation),
    viewerController.updateViewer
);
router.delete("/delete_viewer/:id", viewerController.deleteViewer);
router.patch("/make_viewer_active/:id", viewerController.makeViewerActive);
router.patch("/make_viewer_inactive/:id", viewerController.makeViewerInactive);

export const viewerRoutes = router;