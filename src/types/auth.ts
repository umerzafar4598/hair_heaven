export interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    emailVerified: boolean;
    phone?: string;
    role: "owner" | "staff" | "customer";
    createdAt: Date;
    updatedAt: Date;
}

export interface Session {
    id: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: User;
    session?: Session;
    error?: string;
}


export interface VerifyEmailRequest {
    token: string;
    email: string;
}

export interface ResendVerificationRequest {
    email: string;
}

export interface SocialProviderAccount {
    provider: "google" | "github";
    providerAccountId: string;
    accessToken: string;
    refreshToken?: string;
}


