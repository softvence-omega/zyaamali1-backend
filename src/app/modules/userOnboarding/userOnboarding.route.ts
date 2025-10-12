import express from "express";
import { onboardingController } from "./userOnboarding.controller";

const router = express.Router();

// Create onboarding data
router.post("/create", onboardingController.create);

// Get single onboarding data by ID
router.get("/get-single/:userId", onboardingController.get);

// Update onboarding data by ID
router.put("/update/:id", onboardingController.update);

export const onboardingRoute = router;
