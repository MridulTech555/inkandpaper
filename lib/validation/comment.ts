import { z } from "zod";

export const commentContentSchema = z
  .string()
  .trim()
  .min(1, "Write something before posting.")
  .max(2000, "Comments can't be longer than 2000 characters.");
