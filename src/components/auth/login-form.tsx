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
import logo from '../../../public/hair_heaven_logo.png'
import Link from "next/link"
import { toast } from "sonner"
import { LoadingSwap } from "../ui/loading-swap"

import { SocialAuthButtons } from "./social-auth-buttons"
import { useActionState, useEffect } from "react"
import { signInAction } from "@/actions/authAction"
import { type AuthActionState } from "@/types/authAcitionState"
import { useRouter } from "next/navigation"


const initialState: AuthActionState = {
    success: false,
    message: '',
    errors: {},
}

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [state, formAction, isPending] = useActionState(signInAction, initialState);
    const router = useRouter();
    useEffect(() => {
        if (state.success) {
            toast.success("Login Successfull!",
                { description: state.message, position: "top-right" }
            )
            router.push("/")
        }
        if (!state.success && state.message) {
            toast.error("Login Failed!", { description: state.message, position: "top-right" })
        }
    }, [state, router])

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 border border-black">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" action={formAction}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-balance text-muted-foreground">
                                    Login to your account
                                </p>
                            </div>
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
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Link
                                        href="/forgot-password"
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
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
                            <Field>
                                <Button type="submit" disabled={isPending}>
                                    <LoadingSwap isLoading={isPending}>
                                        Login
                                    </LoadingSwap>
                                </Button>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Or continue with
                            </FieldSeparator>
                            <Field className="grid grid-cols-2 gap-4">
                                <SocialAuthButtons />
                            </Field>
                            <FieldDescription className="text-center">
                                Don&apos;t have an account? <Link href="/auth/register">Sign up</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <Image
                            src={logo}
                            alt="Image"
                            loading="eager"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

