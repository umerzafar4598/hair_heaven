
import SignOutBtn from "@/components/home/signout-btn";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

import { headers } from "next/headers";
import Link from "next/link";


export default async function Home() {
    const session = await auth.api.getSession({ headers: await headers() })

    return (
        <div className="">
            {session == null ? (
                <div className="flex flex-col items-center justify-center gap-2">
                    <h1 className="text-3xl font-bold">Welcome to Hair Heaven</h1>
                    <Button asChild size="lg">
                        <Link href="/auth/login">SignUp / Login</Link>
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                    <h1 className="text-3xl font-bold">Welcome to Hair Heaven</h1>
                    <h2 className="text-2xl">{session.user.name}</h2>
                    <SignOutBtn />
                </div>
            )}
        </div>
    )
}
