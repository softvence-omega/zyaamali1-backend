
import express from "express";
import { creatorController } from "./creator.controller";

const router = express.Router();

router.post("/post_creator", creatorController.postCreator);
router.get("/get_all_creator", creatorController.getAllCreator);
router.get("/get_single_creator/:id", creatorController.getSingleCreator);
router.patch("/update_creator/:id", creatorController.updateCreator);
router.delete("/delete_creator/:id", creatorController.deleteCreator);
router.patch("/make_creator_active/:id", creatorController.makeCreatorActive);
router.patch("/make_creator_inactive/:id", creatorController.makeCreatorInactive);
export const creatorRoutes = router;