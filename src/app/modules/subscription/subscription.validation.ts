import { z } from 'zod';
    
    export const subscriptionPostValidation = z.object({
      // Example field (you can adjust based on your model)
      name: z.string().min(1, { message: "Name is required" }),
      // Add other fields based on your model's needs
    });
    
    
    export const subscriptionUpdateValidation = subscriptionPostValidation.partial();
    