import {
    pgTable,
    text,
    timestamp,
    boolean,
    numeric,
    integer,
    date,
    jsonb,
    index,
    uuid,
} from 'drizzle-orm/pg-core';
import { staff } from './staff';
import { relations } from 'drizzle-orm';

// ============================================================
// SHOP SETTINGS - Single configuration row
// ============================================================

export const shopSettings = pgTable(
    'shop_settings',
    {
        id: uuid('id').primaryKey().defaultRandom(), // Single row

        // Shop info
        name: text('name').notNull(),
        description: text('description'),
        phone: text('phone').notNull(),
        email: text('email').notNull(),
        website: text('website'),

        // Address
        address: text('address').notNull(),
        city: text('city').notNull(),
        area: text('area'),
        latitude: numeric('latitude', { precision: 10, scale: 8 }),
        longitude: numeric('longitude', { precision: 10, scale: 8 }),

        // Media
        logo: text('logo'), // Cloudinary
        favicon: text('favicon'),
        coverImage: text('cover_image'),

        // Operating hours
        businessHours: jsonb('business_hours').default(
            JSON.stringify({
                monday: { isOpen: true, open: '09:00', close: '18:00', lunch: { start: '13:00', end: '14:00' } },
                tuesday: { isOpen: true, open: '09:00', close: '18:00', lunch: { start: '13:00', end: '14:00' } },
                wednesday: { isOpen: true, open: '09:00', close: '18:00', lunch: { start: '13:00', end: '14:00' } },
                thursday: { isOpen: true, open: '09:00', close: '18:00', lunch: { start: '13:00', end: '14:00' } },
                friday: { isOpen: true, open: '09:00', close: '18:00', lunch: { start: '13:00', end: '14:00' } },
                saturday: { isOpen: true, open: '10:00', close: '17:00', lunch: { start: '13:00', end: '14:00' } },
                sunday: { isOpen: true, open: '10:00', close: '17:00', lunch: { start: '13:00', end: '14:00' } }
            })
        ),

        // Appointment settings
        timeSlotDuration: integer('time_slot_duration').default(30),
        bufferTime: integer('buffer_time').default(5),
        maxAdvanceBooking: integer('max_advance_booking').default(60),
        minAdvanceBooking: integer('min_advance_booking').default(15),

        // Features
        enableOnlineBooking: boolean('enable_online_booking').default(true),
        enableOnlinePayment: boolean('enable_online_payment').default(true),
        enableAppointmentReminders: boolean('enable_appointment_reminders').default(true),
        enableCustomerReviews: boolean('enable_customer_reviews').default(true),
        enableLoyaltyProgram: boolean('enable_loyalty_program').default(true),
        enableInventoryTracking: boolean('enable_inventory_tracking').default(true),

        // Payment & Tax
        currency: text('currency').default('PKR'),
        taxPercentage: numeric('tax_percentage', { precision: 5, scale: 2 }).default('0'),
        taxType: text('tax_type').default('inclusive'), // 'inclusive', 'exclusive'

        // FBR (Pakistan)
        fbrEnabled: boolean('fbr_enabled').default(false),
        fbrTaxpayerId: text('fbr_taxpayer_id'),

        // Notifications
        reminderHoursBefore: integer('reminder_hours_before').default(24),
        confirmationMethod: text('confirmation_method').default('sms'),

        // Display
        timezone: text('timezone').default('Asia/Karachi'),
        dateFormat: text('date_format').default('DD/MM/YYYY'),
        language: text('language').default('en'),

        // Loyalty
        pointsPerPkr: numeric('points_per_pkr', { precision: 5, scale: 2 }).default('1'),
        pointsExpiryMonths: integer('points_expiry_months').default(12),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    }
);

export type ShopSettings = typeof shopSettings.$inferSelect;
export type ShopSettingsInsert = typeof shopSettings.$inferInsert;

// ============================================================
// GALLERY
// ============================================================

export const gallery = pgTable(
    'gallery',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        image: text('image').notNull(), // Cloudinary URL
        title: text('title'),
        description: text('description'),
        altText: text('alt_text'),

        category: text('category').default('general'),
        // 'portfolio', 'team', 'event', 'facility', 'before_after', 'testimonial'

        staffId: uuid('staff_id').references(() => staff.id, { onDelete: 'set null' }),

        displayOrder: integer('display_order').default(0),
        isPublished: boolean('is_published').default(true),

        likes: integer('likes').default(0),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        categoryIdx: index('idx_gallery_category').on(table.category),
        publishedIdx: index('idx_gallery_published').on(table.isPublished),
    })
);

export type Gallery = typeof gallery.$inferSelect;
export type GalleryInsert = typeof gallery.$inferInsert;

// ============================================================
// PROMOTIONS
// ============================================================

export const promotions = pgTable(
    'promotions',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        name: text('name').notNull(),
        description: text('description'),
        image: text('image'), // Cloudinary
        code: text('code').unique(),

        // Discount
        type: text('type').notNull(),
        // 'percentage', 'fixed_amount', 'loyalty_points', 'buy_x_get_y'
        value: numeric('value', { precision: 10, scale: 2 }).notNull(),

        maxDiscount: numeric('max_discount', { precision: 10, scale: 2 }),
        minimumSpend: numeric('minimum_spend', { precision: 10, scale: 2 }),

        // Services
        applicableServices: jsonb('applicable_services'), // null = all services

        // Dates
        validFrom: date('valid_from').notNull(),
        validUntil: date('valid_until').notNull(),
        validDays: jsonb('valid_days'), // null = all days

        // Usage limits
        maxUses: integer('max_uses'),
        usageCount: integer('usage_count').default(0),
        maxUsesPerCustomer: integer('max_uses_per_customer'),

        isActive: boolean('is_active').default(true),

        createdBy: uuid('created_by')
            .references(() => staff.id, { onDelete: 'set null' }),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        codeIdx: index('idx_promotions_code').on(table.code),
        activeIdx: index('idx_promotions_active').on(table.isActive),
    })
);

export type Promotion = typeof promotions.$inferSelect;
export type PromotionInsert = typeof promotions.$inferInsert;

// ============================================================
// PROMOTION SERVICES - Which services a promotion applies to
// ============================================================

export const promotionServices = pgTable(
    'promotion_services',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        promotionId: uuid('promotion_id')
            .notNull()
            .references(() => promotions.id, { onDelete: 'cascade' }),

        serviceId: uuid('service_id').notNull(), // Service ID this promotion applies to

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        promotionIdx: index('idx_promotion_services_promotion').on(table.promotionId),
    })
);

export type PromotionService = typeof promotionServices.$inferSelect;
export type PromotionServiceInsert = typeof promotionServices.$inferInsert;

// ============================================================
// HOLIDAYS
// ============================================================

export const holidays = pgTable(
    'holidays',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        date: date('date').notNull().unique(),
        name: text('name').notNull(),
        description: text('description'),

        isFullDay: boolean('is_full_day').default(true),
        startTime: text('start_time'),
        endTime: text('end_time'),

        type: text('type').default('holiday'),
        // 'holiday', 'event', 'special_closure'

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        dateIdx: index('idx_holidays_date').on(table.date),
    })
);

export type Holiday = typeof holidays.$inferSelect;
export type HolidayInsert = typeof holidays.$inferInsert;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notifications = pgTable(
    'notifications',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        staffId: uuid('staff_id').references(() => staff.id, { onDelete: 'cascade' }),

        type: text('type').notNull(),
        // 'appointment_reminder', 'low_stock', 'payment_received', 'review_received', 'system'

        title: text('title').notNull(),
        message: text('message').notNull(),

        channel: text('channel').notNull(),
        // 'sms', 'email', 'push', 'in_app'

        status: text('status').default('pending'),
        // 'pending', 'sent', 'failed', 'read'

        scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
        sentAt: timestamp('sent_at', { withTimezone: true }),
        readAt: timestamp('read_at', { withTimezone: true }),

        attemptCount: integer('attempt_count').default(0),
        lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
        errorMessage: text('error_message'),

        relatedEntityId: text('related_entity_id'),
        metadata: jsonb('metadata'),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        staffIdx: index('idx_notifications_staff').on(table.staffId),
        statusIdx: index('idx_notifications_status').on(table.status),
        typeIdx: index('idx_notifications_type').on(table.type),
    })
);

export type Notification = typeof notifications.$inferSelect;
export type NotificationInsert = typeof notifications.$inferInsert;

// ============================================================
// EXPENSES
// ============================================================

export const expenses = pgTable(
    'expenses',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        category: text('category').notNull(),
        // 'rent', 'utilities', 'supplies', 'equipment', 'payroll', 'marketing', 'maintenance'

        description: text('description').notNull(),
        amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
        currency: text('currency').default('PKR'),

        date: date('date').notNull(),
        paymentMethod: text('payment_method'),
        // 'cash', 'check', 'bank_transfer', 'card', 'credit'

        receipt: text('receipt'), // Cloudinary URL
        receiptNumber: text('receipt_number'),
        vendorName: text('vendor_name'),

        budgetCategory: text('budget_category'),

        notes: text('notes'),
        internalNotes: text('internal_notes'),

        requiresApproval: boolean('requires_approval').default(false),
        approvedBy: uuid('approved_by').references(() => staff.id, { onDelete: 'set null' }),
        approvalDate: timestamp('approval_date', { withTimezone: true }),

        recordedBy: uuid('recorded_by').references(() => staff.id, { onDelete: 'set null' }),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        dateIdx: index('idx_expenses_date').on(table.date),
        categoryIdx: index('idx_expenses_category').on(table.category),
    })
);

export type Expense = typeof expenses.$inferSelect;
export type ExpenseInsert = typeof expenses.$inferInsert;

// ============================================================
// AUDIT LOGS
// ============================================================

export const auditLogs = pgTable(
    'audit_logs',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        action: text('action').notNull(),
        // 'create', 'update', 'delete', 'export', 'login'

        entity: text('entity').notNull(),
        entityId: text('entity_id'),

        staffId: uuid('staff_id').references(() => staff.id, { onDelete: 'set null' }),
        staffEmail: text('staff_email'),

        oldValues: jsonb('old_values'),
        newValues: jsonb('new_values'),

        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        description: text('description'),

        severity: text('severity').default('info'),
        // 'info', 'warning', 'critical'

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        staffIdx: index('idx_audit_logs_staff').on(table.staffId),
        actionIdx: index('idx_audit_logs_action').on(table.action),
        entityIdx: index('idx_audit_logs_entity').on(table.entity),
        createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
    })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type AuditLogInsert = typeof auditLogs.$inferInsert;

// ============================================================
// RELATIONS
// ============================================================

export const galleryRelations = relations(gallery, ({ one }) => ({
    staff: one(staff, {
        fields: [gallery.staffId],
        references: [staff.id],
    }),
}));

export const promotionsRelations = relations(promotions, ({ one, many }) => ({
    createdByStaff: one(staff, {
        fields: [promotions.createdBy],
        references: [staff.id],
    }),
    services: many(promotionServices),
}));

export const promotionServicesRelations = relations(promotionServices, ({ one }) => ({
    promotion: one(promotions, {
        fields: [promotionServices.promotionId],
        references: [promotions.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    staff: one(staff, {
        fields: [notifications.staffId],
        references: [staff.id],
    }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
    approvedByStaff: one(staff, {
        fields: [expenses.approvedBy],
        references: [staff.id],
    }),
    recordedByStaff: one(staff, {
        fields: [expenses.recordedBy],
        references: [staff.id],
    }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    staff: one(staff, {
        fields: [auditLogs.staffId],
        references: [staff.id],
    }),
}));