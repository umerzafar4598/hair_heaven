import { GithubIcon, GoogleIcon } from "@/components/auth/oauth-icons"
import { ComponentProps, ElementType } from "react"



export const SUPPORTED_OAUTH_PROVIDERS = ["github", "google"] as const
export type SupportedOauthProviders = (typeof SUPPORTED_OAUTH_PROVIDERS)[number]

export const SUPPORTED_OAUTH_PROVIDERS_DETAILS: Record<SupportedOauthProviders, { name: string, Icon: ElementType<ComponentProps<"svg">> }> = {
    github: { name: "Github", Icon: GithubIcon },
    google: { name: "google", Icon: GoogleIcon }
}



