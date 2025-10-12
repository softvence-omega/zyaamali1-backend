import { User } from "../user/user.model";
import { IOnboardingData, OnboardingDataModel } from "./userOnboarding.model";

export const onboardingService = {
    
  async create(data: IOnboardingData & { userId: string }) {
    try {
      // Create onboarding document
      const onboarding = await OnboardingDataModel.create(data);
      console.log("Onboarding created:", onboarding);

      // Update user if onboarding creation is successful
      if (onboarding && data.userId) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: data.userId }, // query object
          { onBoardingcompleted: true }, // update
          { new: true } // return updated document
        );
        console.log("User updated:", updatedUser);
      }

      return onboarding;
    } catch (error) {
      console.error("Error creating onboarding:", error);
      throw new Error("Failed to create onboarding");
    }
  },

  // Get onboarding data (all or by ID)
  async get(userId?: string) {
    if (userId) {
      const onboarding = await OnboardingDataModel.findOne({ userId });
      if (!onboarding) throw new Error("Onboarding data not found");
      return onboarding;
    }
    return await OnboardingDataModel.find();
  },

  // Update onboarding data
  async update(id: string, updateData: Partial<IOnboardingData>) {
    const updated = await OnboardingDataModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );
    if (!updated) throw new Error("Failed to update onboarding data");
    return updated;
  },
};
