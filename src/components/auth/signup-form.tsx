"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import logo from "../../../public/logo-transparent.png"
import Link from "next/link"
import { LoadingSwap } from "../ui/loading-swap"
import { SocialAuthButtons } from "./social-auth-buttons"
import { useActionState, useEffect } from "react"
import { signUpAction } from "@/actions/authAction"
import type { AuthActionState } from "@/types/authAcitionState"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


const initialState: AuthActionState = {
    success: false,
    message: "",
    errors: {},
}

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [state, formAction, isPending] = useActionState(signUpAction, initialState)
    const router = useRouter();

    useEffect(() => {
        if (!state.message) return
        if (state.success) {
            toast.success("Account Created.", { description: state.message, position: "top-right" })
            router.push("/")
        } else {
            toast.error("Sign Up failed!.", {
                description: state.message, position: "top-right"
            })
        }
    }, [state, router])


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form action={formAction} className="p-6 md:p-8">
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Create your account</h1>
                                <p className="text-sm text-balance text-muted-foreground">
                                    Enter your email below to create your account
                                </p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter Your name"
                                    defaultValue={state.values?.name || ""}
                                />
                                {state.errors?.name && (
                                    <p>{state.errors.name[0]}</p>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    defaultValue={state.values?.email || ""}
                                />
                                {state.errors?.email && (
                                    <p id="email-error" className="text-red-500 text-sm">
                                        {state.errors.email[0]}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <Field className="">
                                    <Field>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            defaultValue={state.values?.password || ""}
                                        />
                                        {state.errors?.password && (
                                            <p id="password-error" className="text-red-500 text-sm">
                                                {state.errors.password[0]}
                                            </p>
                                        )}
                                    </Field>
                                </Field>
                                <FieldDescription>
                                    Must be at least 8 characters long.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                >
                                    <LoadingSwap isLoading={isPending}>Create Account</LoadingSwap>

                                </Button>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Or continue with
                            </FieldSeparator>
                            <Field className="grid grid-cols-2 gap-4">
                                <SocialAuthButtons />
                            </Field>
                            <FieldDescription className="text-center">
                                Already have an account? <Link href="/auth/login">Log in</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="relative hidden bg-background md:block">
                        <Image
                            src={logo}
                            alt="Logo"
                            loading="eager"
                            className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
                            priority
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
