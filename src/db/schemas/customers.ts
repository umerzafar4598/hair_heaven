import { boolean, date, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { staff } from "./staff";
import { relations } from "drizzle-orm";
import { appointments, loyaltyTransactions, payments, reviews } from "./appointments";



export const preferredContactMethodEnum = pgEnum(
    "preferred_contact_method", ["sms", "email", "call", "whatsapp"]
)
export const hairTypeEnum = pgEnum(
    "hair_type", ["straight", "wavy", "curly", "coily"]
)
export const skintypeEnum = pgEnum(
    "skin_type", ["oily", "dry", "combination", "sensitive", "normal"]
)
export const scalpTypeEnum = pgEnum(
    "scalp_type", ["dry", "itchy", "sensitive", "flaky", "healthy"]
)
export const loyaltyTierEnum = pgEnum(
    "loyalty_tier", ["bronze", "silver", "gold", "platinum"]
)

export const customerSegmentEnum = pgEnum(
    "customer_segment", ["new", "regular", "vip", "inactive", "at_risk"]
)

export const customers = pgTable("customers", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").unique(),
    phone: text("phone").notNull(),
    avatar: text('avatar'), // Cloudinary URL
    // Contact preferences
    preferredContactMethod: preferredContactMethodEnum('preferred_contact_method').default('sms'),
    enableReminders: boolean('enable_reminders').default(true),
    enablePromotions: boolean('enable_promotions').default(true),
    enableNewsletters: boolean('enable_newsletters').default(false),

    // Demographics
    gender: text('gender').default("male"),
    dateOfBirth: date('date_of_birth'),
    occupation: text('occupation'),
    // Address
    address: text('address'),
    city: text('city'),
    area: text('area'), // Specific area/neighborhood

    // Preferences
    preferredStaffId: uuid('preferred_staff_id')
        .references(() => staff.id, { onDelete: 'set null' }),
    preferredServices: jsonb('preferred_services'), // Array of service IDs

    // Hair & Skin profile
    hairType: hairTypeEnum('hair_type'),
    hairColor: text('hair_color'),
    skinType: skintypeEnum('skin_type'),
    scalp: scalpTypeEnum('scalp_type'),
    allergies: jsonb('allergies'), // Array of allergies

    // Appointment history
    totalAppointments: integer('total_appointments').default(0),
    completedAppointments: integer('completed_appointments').default(0),
    cancelledAppointments: integer('cancelled_appointments').default(0),
    noShowCount: integer('no_show_count').default(0),

    // Financial metrics
    totalSpent: numeric('total_spent', { precision: 12, scale: 2 }).default('0'),
    averageSpend: numeric('average_spend', { precision: 10, scale: 2 }).default('0'),
    lastAppointment: timestamp('last_appointment', { withTimezone: true }),

    // Loyalty
    loyaltyPoints: integer('loyalty_points').default(0),
    lifetimePoints: integer('lifetime_points').default(0),
    loyaltyTier: loyaltyTierEnum('loyalty_tier').default('bronze'),

    // Customer categorization
    customerSegment: customerSegmentEnum('customer_segment').default('regular'),

    // Notes
    notes: text('notes'),
    personalNotes: text('personal_notes'), // Staff private notes

    // Blocklist
    isBlacklisted: boolean('is_blacklisted').default(false),
    blacklistReason: text('blacklist_reason'),

    // Status
    isActive: boolean('is_active').default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    phoneIdx: unique('uk_customers_phone').on(table.phone),
    userIdx: index('idx_customers_user').on(table.userId),
    preferredStaffIdx: index('idx_customers_preferred_staff').on(table.preferredStaffId),
    segmentIdx: index('idx_customers_segment').on(table.customerSegment),
})
);
export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = typeof customers.$inferInsert;

// Relations

export const customersRelations = relations(customers, ({ one, many }) => ({
    user: one(user, {
        fields: [customers.userId],
        references: [user.id],
    }),
    preferredStaff: one(staff, {
        fields: [customers.preferredStaffId],
        references: [staff.id],
    }),
    appointments: many(appointments),
    reviews: many(reviews),
    loyaltyTransactions: many(loyaltyTransactions),
    payments: many(payments),
}));