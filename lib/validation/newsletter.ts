import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z.email("Enter a valid email address."),
});
