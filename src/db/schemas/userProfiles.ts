import { boolean, index, jsonb, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";


export const userTypeEnum = pgEnum("user_type", ["customer", "staff", "owner"])
export const twoFactorMethodEnum = pgEnum("2FA_method", ["sms", "email", "authenticator"])

export const userProfiles = pgTable("user_profile", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" })
        .unique(),
    userType: userTypeEnum("user_type").notNull(),
    phone: text("phone"),
    phoneVerified: boolean("phone_verified").$default(() => true),
    twoFactorEnabled: boolean('2FA_enabled').default(false),
    twoFactorMethod: twoFactorMethodEnum('2FA_method'),
    // Preferences
    preferredLanguage: text('preferred_lang').default('en'),
    timezone: text('timezone').default('Asia/Karachi'),
    notificationPreferences: jsonb("notification_pref").default(
        JSON.stringify({
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: false,
            marketingEmails: true,
            appointmentReminders: true,
            promotionNotifications: true,
        })
    ),
    // Account Status
    isActive: boolean('is_active').default(true),
    isSuspended: boolean("is_suspended").default(false),
    suspensionReason: text("suspension_reason"),
    // Metadata
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    ipAddressList: jsonb("ip_address_list"), // array of recent ips;
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    userIdx: unique("uk_user_profiles_user").on(table.userId),
    userTypeIdx: index("idx_user_profiles_type").on(table.userType),
})
);

export type UserProfile = typeof userProfiles.$inferSelect;
export type UserProfileInsert = typeof userProfiles.$inferInsert;

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(user, {
        fields: [userProfiles.userId],
        references: [user.id],
    }),
}));