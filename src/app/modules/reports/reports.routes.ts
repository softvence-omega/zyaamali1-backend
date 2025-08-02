
import express from "express";
import { reportsController } from "./reports.controller";
import { reportsPostValidation, reportsUpdateValidation } from "./reports.validation";
import { validateRequest } from "../../middleWear/validateRequest";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";

const router = express.Router();
router.get("/get-total-campaign-report", auth(USER_ROLE.VIEWER, USER_ROLE.ADMIN, USER_ROLE.CREATOR), reportsController.getAllCampaignReport);





router.post("/post_reports", validateRequest(reportsPostValidation), reportsController.postReports);
router.get("/get_single_reports/:id", reportsController.getSingleReports);
router.put("/update_reports/:id", validateRequest(reportsUpdateValidation), reportsController.updateReports);
router.delete("/delete_reports/:id", reportsController.deleteReports);

export const reportsRoutes = router;