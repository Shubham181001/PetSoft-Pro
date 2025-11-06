import z from "zod";
import { DEFAULT_PET_IMAGE } from "./constants";

export const petIdSchema = z.cuid();

export const petFormSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Name is required" }).max(100),
    ownerName: z
      .string()
      .trim()
      .min(1, { message: "owner name is required" })
      .max(100),
    imageUrl: z.union([
      z.literal(""),
      z.url({ message: "Image url must be a valid url" }),
    ]),
    age: z.coerce
      .number()
      .int()
      .positive()
      .max(100, { message: "age must be greater than 0" }),
    notes: z.union([z.literal(""), z.string().trim().max(1000)]),
  })
  .transform((data) => ({
    ...data,
    imageUrl: data.imageUrl || DEFAULT_PET_IMAGE,
  }));

export type TPetForm = z.infer<typeof petFormSchema>;

export const authSchema = z.object({
  email: z.email().max(100),
  password: z.string().max(100),
});

export type TAuth = z.infer<typeof authSchema>;