import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation";



export default async function AppointmentsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect('/login')
    }
    return (
        <div>
            <h1 className="text-center text-3xl">Appointments</h1>
            <h1 className="text-center mt-2 text-2xl text-olive-700 font-bold">{session.user.name}</h1>
        </div>
    )
}