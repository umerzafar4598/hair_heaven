import z from "zod"

export const signupSchema = z.object({
    name: z.string().min(3, "Name must be atleast 3 character"),
    email: z.email("Invalid Email"),
    password: z
        .string()
        .min(8, "Password must be atleast 8 characters.")
        .regex(/[A-Z]/, "Must include uppercase")
        .regex(/[0-9]/, "Must include number"),
})

export const signinSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(8, "Password is required"),
})


export type SignupForm = z.infer<typeof signupSchema>
export type SigninForm = z.infer<typeof signinSchema>