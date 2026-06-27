"use server"

import { auth, type OauthProvider } from "@/lib/auth";
import { signinSchema, signupSchema } from "@/lib/validations/auth"
import { AuthActionState } from "@/types/authAcitionState";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";



function getString(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
}

// Sign Up Server Action

export async function signUpAction(
    prevState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const rawData = {
        name: getString(formData, "name"),
        email: getString(formData, "email"),
        password: getString(formData, "password"),
    }
    const parsed = signupSchema.safeParse(rawData);
    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        return {
            success: false,
            message: "Input Validation Failed Try again",
            errors: Object.fromEntries(
                Object.entries(tree.properties ?? {}).map(([key, val]) => [key, val?.errors ?? []])
            ),
            values: rawData
        }
    }
    const { name, email, password } = parsed.data;
    let res;
    try {
        res = await auth.api.signUpEmail({
            body: { name, email, password },
            headers: await headers(),
        })
        console.log("---SignUp Res", res)
    } catch (err: unknown) {
        let message = "Sign Up Failed";
        if (err instanceof Error) {
            if (err.message.toLowerCase().includes("exists")) {
                return {
                    success: false,
                    message: "Email already exists.",
                    errors: { email: ["Email already registered"] },
                    values: rawData,
                }
            }
            message = err.message
        }
        return {
            success: false,
            message,
        }
    }
    if (!res) {
        return {
            success: false,
            message: "Please fill the requried data!"
        }
    }
    return {
        success: true,
        message: "Welcome aboard"
    }
}

// Sign Ip Server Action
export async function signInAction(
    prevState: AuthActionState,
    formData: FormData
): Promise<AuthActionState> {
    const rawData = {
        email: getString(formData, "email"),
        password: getString(formData, "password")
    }
    const parsed = signinSchema.safeParse(rawData)
    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        return {
            success: false,
            message: "Validation Failed. Please fix the errors",
            errors: Object.fromEntries(
                Object.entries(tree.properties ?? {}).map(([key, val]) => [key, val?.errors ?? []])
            ),
            values: rawData
        };
    }
    const { email, password } = parsed.data;
    let res;
    try {
        res = await auth.api.signInEmail({
            body: { email, password },
            headers: await headers(),
        })
        console.log("-----SignIn Res", res)
    } catch (err: unknown) {
        let message = "Invalid Credentials"
        if (err instanceof Error) {
            message = err.message
        }
        return {
            success: false,
            message,
            errors: {
                password: ["Invalid email or password"],
            },
            values: rawData,
        }
    }
    if (!res) {
        return {
            success: false,
            message: "Login Failed!. Please try again."
        }
    }
    return {
        success: true,
        message: "Welcome Back!🎊"
    }
}


// interface OAuthActionProps {
//     provider: OauthProvider
//     callbackURL?: string
// }

// export async function oauthAction({ provider, callbackURL = "/" }: OAuthActionProps) {
//     const res = await auth.api.signInSocial({
//         headers: await headers(),
//         body: {
//             provider,
//             callbackURL,
//         }
//     })
//     return {
//         url: res.url,
//         error: null,
//     }
// }