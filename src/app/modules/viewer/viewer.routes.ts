
import express from "express";
import { viewerController } from "./viewer.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { viewerUpdateValidation } from "./viewer.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";

const router = express.Router();

router.post("/post_viewer",auth(USER_ROLE.ADMIN), viewerController.postViewer);
router.get("/get_all_viewer",auth(USER_ROLE.ADMIN), viewerController.getAllViewer);
router.get("/get_single_viewer/:id",auth(USER_ROLE.ADMIN), viewerController.getSingleViewer);
router.patch(
    "/update_viewer/:id",
    auth(USER_ROLE.ADMIN),
    validateRequest(viewerUpdateValidation),
    viewerController.updateViewer
);
router.delete("/delete_viewer/:id",auth(USER_ROLE.ADMIN), viewerController.deleteViewer);
router.patch("/make_viewer_active/:id", auth(USER_ROLE.ADMIN), viewerController.makeViewerActive);
router.patch("/make_viewer_inactive/:id",auth(USER_ROLE.ADMIN), viewerController.makeViewerInactive);

export const viewerRoutes = router;