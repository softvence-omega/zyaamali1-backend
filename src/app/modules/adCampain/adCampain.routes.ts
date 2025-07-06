
    import express from "express";
    import { validateRequest } from "../../middlewares/validateRequest";
    import { adCampainController } from "./adCampain.controller";
    import { adCampainPostValidation,adCampainUpdateValidation } from "./adCampain.validation";

    const router = express.Router();
    
    router.post("/post_adCampain", validateRequest(adCampainPostValidation), adCampainController.postAdCampain);
    router.get("/get_all_adCampain", adCampainController.getAllAdCampain);
    router.get("/get_single_adCampain/:id", adCampainController.getSingleAdCampain);
    router.put("/update_adCampain/:id", validateRequest(adCampainUpdateValidation), adCampainController.updateAdCampain);
    router.delete("/delete_adCampain/:id", adCampainController.deleteAdCampain);
    
    export const adCampainRoutes = router;