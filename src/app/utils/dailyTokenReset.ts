import mongoose from "mongoose";
import nodeCron from "node-cron";
import { User } from "../modules/user/user.model";
import { configureModel } from "../modules/configure/configure.model";



nodeCron.schedule('0 0 * * *', async () => {
    console.log("Running daily token reset at midnight");


    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const getTokenFromConfig = await configureModel.findOne();
        if (!getTokenFromConfig) {
            throw new Error("Configuration not found");
        }
        const result = await User.updateMany(
            {
                token: { $lt: getTokenFromConfig.dailyTokenLimit }
            },
            {
                $set: { token: getTokenFromConfig.dailyTokenLimit }
            },
            session
        )

        await session.commitTransaction();
        console.log(`✅ Daily token reset completed for ${result.modifiedCount} users`);
    } catch (error) {
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
})
