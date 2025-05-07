
    import express, { Router } from "express";
    import { paymentController } from "./payment.controller";
    import { paymentPostValidation,paymentUpdateValidation } from "./payment.validation";
import { validateRequest } from "../../middleWear/validateRequest";

    const router = express.Router();

    router.post("/create-checkout-session" , paymentController.createCheckoutSession)
    
    router.post("/post_payment", validateRequest(paymentPostValidation), paymentController.postPayment);
    router.get("/get_all_payment", paymentController.getAllPayment);
    router.get("/get_single_payment/:id", paymentController.getSinglePayment);
    router.put("/update_payment/:id", validateRequest(paymentUpdateValidation), paymentController.updatePayment);
    router.delete("/delete_payment/:id", paymentController.deletePayment);
    
    export const paymentRoutes = router;