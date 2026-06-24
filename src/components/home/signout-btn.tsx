"use client"
import { authClient } from "@/lib/auth-client";
import { BetterAuthActionButton } from "../auth/better-auth-action-btn";
import { useRouter } from "next/navigation";


export default function SignOutBtn() {
    const router = useRouter();
    return (
        <BetterAuthActionButton
            variant="destructive"
            action={async () => {
                const result = await authClient.signOut();
                router.refresh();
                return result
            }}
            successMessage="Sign Out Successfull"
        >
            Sign Out
        </BetterAuthActionButton>
    )
}