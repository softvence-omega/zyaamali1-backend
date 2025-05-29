
import express from "express";
import { configureController } from "./configure.controller";

const router = express.Router();

router.get("/get-all-configure", configureController.getAllConfigure);
router.get("/get_single_configure/:id", configureController.getSingleConfigure);
router.put("/update-configure/:id", configureController.updateConfigure);

export const configureRoutes = router;