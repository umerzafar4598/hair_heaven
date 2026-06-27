export type AuthActionState = {
    success: boolean;
    message: string;
    errors?: Partial<Record<string, string[]>>;
    values?: {
        email?: string;
        password?: string;
        name?: string;
    };
};