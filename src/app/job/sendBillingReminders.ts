// jobs/sendBillingReminders.ts
import cron from "node-cron";
import { subscriptionModel } from "../modules/subscription/subscription.model";
import { User } from "../modules/user/user.model";
import { PricingModel } from "../modules/Pricing/Pricing.model";
import { sendEmail } from "../utils/PaymentEmail";
import { TUser } from "../modules/user/user.interface";
import { IPricingPlan } from "../modules/Pricing/Pricing.interface";
import { ISubscription } from "../modules/subscription/subscription.interface";
import { billingReminderTemplate } from "../utils/templates/billingReminderTemplate";

cron.schedule("0 8 * * *", async () => {
  const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const subscriptions = await subscriptionModel
        .find({ autoRenew: true })
        .populate<{ userId: TUser; pricingPlanId: IPricingPlan; }>("userId pricingPlanId")
        .exec() as unknown as ISubscription[];

    for (const sub of subscriptions) {
        const plan = sub.pricingPlanId as unknown as IPricingPlan;
        const user = sub.userId as unknown as TUser;

        const paymentDate = new Date(sub.paymentDate? sub.paymentDate : Date.now());
        const nextBilling = new Date(paymentDate.getTime()); // clone date safely

        if (plan.billingInterval === "month") {
            nextBilling.setMonth(nextBilling.getMonth() + 1);
        } else if (plan.billingInterval === "year") {
            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        } else {
            nextBilling.setDate(nextBilling.getDate() + 1);
        }

        nextBilling.setHours(0, 0, 0, 0); // normalize

        if (nextBilling.getTime() === tomorrow.getTime()) {
            await sendEmail({
                to: user.email,
                subject: '⏰ Your Subscription Renews Tomorrow',
                html: billingReminderTemplate(user.fullName, plan.name, sub.amountPaid, sub.currency || "usd"),
            });
        }
    }

    console.log("✅ Billing reminder job completed.");
});
