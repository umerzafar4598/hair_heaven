"use client"

import { SUPPORTED_OAUTH_PROVIDERS, SUPPORTED_OAUTH_PROVIDERS_DETAILS } from "@/lib/o-auth-providers"
import { BetterAuthActionButton } from "./better-auth-action-btn";
import { authClient } from "@/lib/auth-client";

export function SocialAuthButtons() {
    return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
        const Icon = SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].Icon;
        return (
            <BetterAuthActionButton
                variant="outline"
                key={provider}
                action={() => {
                    return authClient.signIn.social({
                        provider,
                        callbackURL: "/"
                    })
                }}
            >
                <Icon />
                {SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].name}
            </BetterAuthActionButton>
        )
    })
}