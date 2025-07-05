
import express from "express";
import { viewerController } from "./viewer.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { viewerUpdateValidation } from "./viewer.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";

const router = express.Router();

router.post("/post-viewer",auth(USER_ROLE.ADMIN), viewerController.postViewer);
router.get("/get-all-viewer",auth(USER_ROLE.ADMIN), viewerController.getAllViewer);
router.get("/get-single-viewer/:id",auth(USER_ROLE.ADMIN), viewerController.getSingleViewer);
router.patch(
    "/update-viewer/:id",
    auth(USER_ROLE.ADMIN),
    validateRequest(viewerUpdateValidation),
    viewerController.updateViewer
);
router.delete("/delete-viewer/:id",auth(USER_ROLE.ADMIN), viewerController.deleteViewer);
router.patch("/make-viewer-active/:id", auth(USER_ROLE.ADMIN), viewerController.makeViewerActive);
router.patch("/make-viewer-inactive/:id",auth(USER_ROLE.ADMIN), viewerController.makeViewerInactive);

export const viewerRoutes = router;