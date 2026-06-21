import {
    pgTable,
    text,
    timestamp,
    boolean,
    numeric,
    integer,
    jsonb,
    index,
    unique,
    uuid,
    pgEnum
} from 'drizzle-orm/pg-core';
import { customers } from './customers';
import { staff } from './staff';
import { services } from './services';
import { relations } from 'drizzle-orm';


export const appointmentStatusEnum = pgEnum(
    "appointment_status", ["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"]
)
export const bookingSourceEnum = pgEnum(
    "booking_source", ["online", "phone", "walk-in", "referral"]
)
export const paymentStatusEnum = pgEnum(
    "payment_status", ["pending", "partial", "completed", "refunded", "failed"]
)
export const paymentMethodEnum = pgEnum(
    "payment_method", ["cash", "online", "bank_transfer", "easypaisa", "jazzcash"]
)
export const reminderChannelEnum = pgEnum(
    "reminder_channel", ["sms", "email", "whatsapp", "all"]
)

export const appointments = pgTable("appointments", {
    id: uuid("id").primaryKey().defaultRandom(),
    // References
    customerId: uuid('customer_id')
        .notNull()
        .references(() => customers.id, { onDelete: 'cascade' }),
    staffId: uuid('staff_id')
        .notNull()
        .references(() => staff.id, { onDelete: 'restrict' }),
    // Status
    status: appointmentStatusEnum("status").default("scheduled"),
    bookingSource: bookingSourceEnum("online"),
    // DateTime - timezone aware
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    duration: integer('duration').notNull(), // in minutes

    // Pricing breakdown
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
    discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
    discountReason: text('discount_reason'),
    tax: numeric('tax', { precision: 10, scale: 2 }).default('0'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    // Payment
    paymentStatus: paymentStatusEnum('payment_status').default('pending'),
    paymentMethod: paymentMethodEnum('payment_method'),
    // Communication
    customerNotes: text('customer_notes'),
    staffNotes: text('staff_notes'),

    // Reminders
    reminderSent: boolean('reminder_sent').default(false),
    reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
    reminderChannel: reminderChannelEnum('reminder_channel'),

    // Cancellation
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelledBy: uuid('cancelled_by')
        .references(() => staff.id, { onDelete: 'set null' }),
    cancelReason: text('cancel_reason'),

    // Loyalty
    loyaltyPointsEarned: integer('loyalty_points_earned').default(0),
    loyaltyPointsRedeemed: integer('loyalty_points_redeemed').default(0),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by')
        .references(() => staff.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    updatedBy: uuid('updated_by')
        .references(() => staff.id, { onDelete: 'set null' }),
}, (table) => ({
    customerIdx: index('idx_appointments_customer').on(table.customerId),
    staffIdx: index('idx_appointments_staff').on(table.staffId),
    startTimeIdx: index('idx_appointments_start_time').on(table.startTime),
    statusIdx: index('idx_appointments_status').on(table.status),
    paymentStatusIdx: index('idx_appointments_payment_status').on(table.paymentStatus),
    compositeIdx: index('idx_appointments_staff_time').on(table.staffId, table.startTime),
})
);

export type Appointment = typeof appointments.$inferSelect;
export type AppointmentInsert = typeof appointments.$inferInsert;

export const appointmentServices = pgTable("appointment_services", {
    id: uuid("id").primaryKey().defaultRandom(),
    appointmentId: uuid("appointment_id")
        .notNull()
        .references(() => appointments.id, { onDelete: "cascade" }),
    serviceId: uuid('service_id')
        .notNull()
        .references(() => services.id, { onDelete: 'restrict' }),
    // Snapshot of service at booking time
    serviceName: text('service_name').notNull(),
    servicePrice: numeric('service_price', { precision: 10, scale: 2 }).notNull(),
    serviceDuration: integer('service_duration').notNull(),
    quantity: integer('quantity').default(1),
    lineTotal: numeric('line_total', { precision: 10, scale: 2 }).notNull(),
    notes: text('notes'),
    sequenceOrder: integer('sequence_order'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
},
    (table) => ({
        appointmentIdx: index('idx_appointment_services_appointment').on(table.appointmentId),
        serviceIdx: index('idx_appointment_services_service').on(table.serviceId),
    }));
export type AppointmentService = typeof appointmentServices.$inferSelect;
export type AppointmentServiceInsert = typeof appointmentServices.$inferInsert;

export const appointmentNotes = pgTable("appointment_notes", {
    id: uuid("id").primaryKey().defaultRandom(),
    appointmentId: uuid('appointment_id')
        .notNull()
        .references(() => appointments.id, { onDelete: 'cascade' })
        .unique(),

    // What was done
    servicesPerformed: text('services_performed').notNull(),
    productsUsed: jsonb('products_used'), // Array of {productId, quantity}

    // Customer profile update
    hairType: text('hair_type'),
    skinType: text('skin_type'),
    scalp: text('scalp'),

    // Styling details
    styleApplied: text('style_applied'),
    stylePhotos: jsonb('style_photos'), // Array of Cloudinary URLs
    styleCode: text('style_code'), // Reference code for future bookings
    // Recommendations
    productRecommendations: jsonb('product_recommendations'),
    // Array of {productId, productName, reason}
    nextAppointmentRecommendation: text('next_appointment_recommendation'),
    maintenanceInstructions: text('maintenance_instructions'),

    // Issues
    issuesFound: text('issues_found'),
    issuesResolved: boolean('issues_resolved').default(false),

    // Recording
    recordedBy: uuid('recorded_by')
        .references(() => staff.id, { onDelete: 'set null' }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
},
    (table) => ({
        appointmentIdx: unique('uk_appointment_notes').on(table.appointmentId),
    }));

export type AppointmentNote = typeof appointmentNotes.$inferSelect;
export type AppointmentNoteInsert = typeof appointmentNotes.$inferInsert;


export const appointmentHistory = pgTable("appointment_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    appointmentId: uuid('appointment_id')
        .notNull()
        .references(() => appointments.id, { onDelete: 'cascade' }),
    // Status tracking
    previousStatus: text('previous_status'),
    newStatus: text('new_status').notNull(),
    // Changes
    changedFields: jsonb('changed_fields'),
    // Who made the change
    changedBy: uuid('changed_by')
        .references(() => staff.id, { onDelete: 'set null' }),
    changeReason: text('change_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    appointmentIdx: index('idx_appointment_history_appointment').on(table.appointmentId),
    statusIdx: index('idx_appointment_history_status').on(table.newStatus),
}));

export type AppointmentHistory = typeof appointmentHistory.$inferSelect;
export type AppointmentHistoryInsert = typeof appointmentHistory.$inferInsert;

// ============================================================
// PAYMENTS
// ============================================================

export const payments = pgTable('payments',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        appointmentId: uuid('appointment_id')
            .references(() => appointments.id, { onDelete: 'set null' }),
        customerId: uuid('customer_id')
            .notNull()
            .references(() => customers.id, { onDelete: 'cascade' }),

        // Amount
        amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
        currency: text('currency').default('PKR'),

        // Status
        status: paymentStatusEnum('status').notNull().default('pending'),

        // Method
        method: paymentMethodEnum('method').notNull(),

        // Transaction details
        transactionId: text('transaction_id').unique(),
        receiptNumber: text('receipt_number').unique(),
        reference: text('reference'),

        // Metadata
        description: text('description'),
        metadata: jsonb('metadata'),
        gatewayResponse: jsonb('gateway_response'),
        gatewayError: text('gateway_error'),

        // Refund
        refundedAmount: numeric('refunded_amount', { precision: 12, scale: 2 }).default('0'),
        refundReason: text('refund_reason'),
        refundedAt: timestamp('refunded_at', { withTimezone: true }),
        refundTransactionId: text('refund_transaction_id'),

        // Processing
        processedAt: timestamp('processed_at', { withTimezone: true }),
        processedBy: uuid('processed_by')
            .references(() => staff.id, { onDelete: 'set null' }),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        customerIdx: index('idx_payments_customer').on(table.customerId),
        appointmentIdx: index('idx_payments_appointment').on(table.appointmentId),
        statusIdx: index('idx_payments_status').on(table.status),
        transactionIdx: index('idx_payments_transaction').on(table.transactionId),
    })
);

export type Payment = typeof payments.$inferSelect;
export type PaymentInsert = typeof payments.$inferInsert;

// ============================================================
// REVIEWS
// ============================================================

export const reviews = pgTable(
    'reviews',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        appointmentId: uuid('appointment_id')
            .notNull()
            .references(() => appointments.id, { onDelete: 'cascade' })
            .unique(),
        customerId: uuid('customer_id')
            .notNull()
            .references(() => customers.id, { onDelete: 'cascade' }),
        staffId: uuid('staff_id')
            .references(() => staff.id, { onDelete: 'set null' }),

        // Ratings
        overallRating: integer('overall_rating').notNull(), // 1-5
        serviceQualityRating: integer('service_quality_rating'),
        cleanlinessRating: integer('cleanliness_rating'),
        hygieneRating: integer('hygiene_rating'),
        communicationRating: integer('communication_rating'),
        valueForMoneyRating: integer('value_for_money_rating'),
        professionalismRating: integer('professionalism_rating'),

        // Content
        comment: text('comment'),
        wouldRecommend: boolean('would_recommend'),

        // Media
        photos: jsonb('photos'), // Array of Cloudinary URLs

        // Moderation
        isPublished: boolean('is_published').default(true),
        isVerified: boolean('is_verified').default(true),
        flagged: boolean('flagged').default(false),
        flagReason: text('flag_reason'),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        customerIdx: index('idx_reviews_customer').on(table.customerId),
        staffIdx: index('idx_reviews_staff').on(table.staffId),
        appointmentIdx: unique('uk_reviews_appointment').on(table.appointmentId),
    })
);

export type Review = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;

// ============================================================
// LOYALTY TRANSACTIONS
// ============================================================

export const loyaltyTransactions = pgTable(
    'loyalty_transactions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        customerId: uuid('customer_id')
            .notNull()
            .references(() => customers.id, { onDelete: 'cascade' }),
        appointmentId: uuid('appointment_id')
            .references(() => appointments.id, { onDelete: 'set null' }),

        // Type
        type: text('type').notNull(),
        // 'earned', 'redeemed', 'expired', 'adjusted', 'referral_bonus', 'promo_bonus'

        // Points
        points: integer('points').notNull(),

        // Details
        description: text('description'),
        reference: text('reference'),
        redemptionFor: text('redemption_for'),

        // Recording
        recordedBy: uuid('recorded_by')
            .references(() => staff.id, { onDelete: 'set null' }),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        customerIdx: index('idx_loyalty_transactions_customer').on(table.customerId),
        typeIdx: index('idx_loyalty_transactions_type').on(table.type),
    })
);

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type LoyaltyTransactionInsert = typeof loyaltyTransactions.$inferInsert;

// ============================================================
// RELATIONS
// ============================================================

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
    customer: one(customers, {
        fields: [appointments.customerId],
        references: [customers.id],
    }),
    staff: one(staff, {
        fields: [appointments.staffId],
        references: [staff.id],
    }),
    services: many(appointmentServices),
    notes: one(appointmentNotes),
    history: many(appointmentHistory),
    payments: many(payments),
    review: one(reviews),
}));

export const appointmentServicesRelations = relations(appointmentServices, ({ one }) => ({
    appointment: one(appointments, {
        fields: [appointmentServices.appointmentId],
        references: [appointments.id],
    }),
    service: one(services, {
        fields: [appointmentServices.serviceId],
        references: [services.id],
    }),
}));

export const appointmentNotesRelations = relations(appointmentNotes, ({ one }) => ({
    appointment: one(appointments, {
        fields: [appointmentNotes.appointmentId],
        references: [appointments.id],
    }),
    recordedBy: one(staff, {
        fields: [appointmentNotes.recordedBy],
        references: [staff.id],
    }),
}));

export const appointmentHistoryRelations = relations(appointmentHistory, ({ one }) => ({
    appointment: one(appointments, {
        fields: [appointmentHistory.appointmentId],
        references: [appointments.id],
    }),
    changedByStaff: one(staff, {
        fields: [appointmentHistory.changedBy],
        references: [staff.id],
    }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    appointment: one(appointments, {
        fields: [payments.appointmentId],
        references: [appointments.id],
    }),
    customer: one(customers, {
        fields: [payments.customerId],
        references: [customers.id],
    }),
    processedByStaff: one(staff, {
        fields: [payments.processedBy],
        references: [staff.id],
    }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
    appointment: one(appointments, {
        fields: [reviews.appointmentId],
        references: [appointments.id],
    }),
    customer: one(customers, {
        fields: [reviews.customerId],
        references: [customers.id],
    }),
    staff: one(staff, {
        fields: [reviews.staffId],
        references: [staff.id],
    }),
}));

export const loyaltyTransactionsRelations = relations(loyaltyTransactions, ({ one }) => ({
    customer: one(customers, {
        fields: [loyaltyTransactions.customerId],
        references: [customers.id],
    }),
    appointment: one(appointments, {
        fields: [loyaltyTransactions.appointmentId],
        references: [appointments.id],
    }),
    recordedByStaff: one(staff, {
        fields: [loyaltyTransactions.recordedBy],
        references: [staff.id],
    }),
}));