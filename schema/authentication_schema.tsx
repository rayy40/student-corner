import z from "zod";

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .regex(new RegExp(".*[A-Z].*"), "Missing uppercase character")
    .regex(new RegExp(".*[a-z].*"), "Missing lowercase character")
    .regex(new RegExp(".*\\d.*"), "Missing number")
    .regex(
      new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
      "Missing special character"
    )
    .min(8, "Must be at least 8 characters in length"),
  code: z.string().min(6, "Must be 6 digits").optional(),
});

export const loginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});
