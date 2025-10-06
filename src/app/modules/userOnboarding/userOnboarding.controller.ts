import { Request, Response } from "express";
import { onboardingService } from "./userOnboarding.service";

export const onboardingController = {
  // Create new onboarding entry
  async create(req: Request, res: Response) {
    try {
      const result = await onboardingService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Onboarding data created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Get all or single onboarding data
  async get(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const result = await onboardingService.get(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // Update onboarding data
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await onboardingService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: "Onboarding data updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
