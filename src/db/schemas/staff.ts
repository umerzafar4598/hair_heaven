import { boolean, date, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";
import { barberServices } from "./services";




export const staffRoleEnum = pgEnum("role", ["owner", "manager", "barber", "stylist", "receptionist"]);
export const employmentStatusEnum = pgEnum("employment_status", ["active", "inactive", "onleave", "suspended"])
export const scheduleTypeEnum = pgEnum("schedule_type", ["working", "off", "partial", "half_day", "emergency_off"]);
export const leaveTypeEnum = pgEnum("leave_type", ["sick_leave", "casual_leave", "annual_leave", "emergency_leave"])


export const staff = pgTable("staff", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" })
        .unique(),
    role: staffRoleEnum("role").notNull(),
    // Professional Details
    bio: text("bio"),
    specialties: jsonb("specialties"),
    languages: jsonb("languages"),
    experience: integer("experience"),
    // Identifications & Legal
    cnic: text("cnic").unique(),
    cnicVerified: boolean("cnic_verified").default(false),
    taxId: text("tax_id"),
    ntn: text("ntn"), // National Tax number;
    // Employment details
    hireDate: date("hire_date"),
    employmentStatus: employmentStatusEnum("employment_status").default("active"),
    // Compensation Structure
    baseSalary: numeric("base_salary", { precision: 10, scale: 2 }),
    commissionPercentage: numeric('commission_percentage', { precision: 5, scale: 2 }),
    bonusStructure: jsonb('bonus_structure'), // {monthly: true, quarterly: true}
    // Bank details for salary
    bankName: text('bank_name'),
    bankAccountNumber: text('bank_account_number'),
    bankIban: text('bank_iban'),
    // Performance metrics
    totalAppointments: integer('total_appointments').default(0),
    completedAppointments: integer('completed_appointments').default(0),
    cancelledAppointments: integer('cancelled_appointments').default(0),
    noShowCount: integer('no_show_count').default(0),
    totalEarnings: numeric('total_earnings', { precision: 12, scale: 2 }).default('0'),
    averageRating: numeric('average_rating', { precision: 3, scale: 2 }).default('5.00'),
    totalReviews: integer('total_reviews').default(0),
    // Availability
    defaultStartTime: text('default_start_time'), // '09:00'
    defaultEndTime: text('default_end_time'), // '18:00'
    // Document uploads
    certificateUrl: text('certificate_url'), // Cloudinary
    licenseUrl: text('license_url'),
    // Additional metadata
    emergencyContact: text('emergency_contact'),
    emergencyPhone: text('emergency_phone'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    userIdx: unique('uk_staff_user').on(table.userId),
    roleIdx: index('idx_staff_role').on(table.role),
    statusIdx: index('idx_staff_status').on(table.employmentStatus),
    cnicIdx: index('idx_staff_cnic').on(table.cnic),
})
);

export type Staff = typeof staff.$inferSelect;
export type StaffInsert = typeof staff.$inferInsert;


export const staffSchedule = pgTable("staff_schedule", {
    id: uuid("id").primaryKey().defaultRandom(),
    staffId: uuid("staff_id")
        .notNull()
        .references(() => staff.id, { onDelete: "cascade" }),
    // Date and day
    date: date('date').notNull(),
    dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 6=Saturday
    scheduleType: scheduleTypeEnum("schedule_type").notNull().default("working"),
    // Working hours
    startTime: text('start_time'), // '09:00'
    endTime: text('end_time'), // '18:00'
    // Breaks
    breakStartTime: text('break_start_time'), // '13:00'
    breakEndTime: text('break_end_time'), // '14:00' 
    // Max appointments for the day
    maxAppointments: integer('max_appointments'),

    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    staffDateIdx: unique('uk_staff_schedule_date').on(table.staffId, table.date),
    staffIdx: index('idx_staff_schedule_staff').on(table.staffId),
    dateIdx: index('idx_staff_schedule_date').on(table.date),
})
);
export type StaffSchedule = typeof staffSchedule.$inferSelect;
export type StaffScheduleInsert = typeof staffSchedule.$inferInsert;

export const staffLeave = pgTable("staff_leave", {
    id: uuid("id").primaryKey().defaultRandom(),
    staffId: uuid("staff_id")
        .notNull()
        .references(() => staff.id, { onDelete: "cascade" }),
    // Leave period
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    totalDays: integer('total_days').notNull(),
    leaveType: leaveTypeEnum().notNull(),
    // Details
    reason: text('reason').notNull(),
    documentUrl: text('document_url'),
    // Approval workflow
    status: text('status').default('pending'),
    // 'pending', 'approved', 'rejected'
    approvedBy: uuid('approved_by')
        .references(() => staff.id, { onDelete: 'set null' }),
    approvalDate: timestamp('approval_date', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
    replacementStaffId: uuid('replacement_staff_id')
        .references(() => staff.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    staffIdx: index('idx_staff_leave_staff').on(table.staffId),
    statusIdx: index('idx_staff_leave_status').on(table.status),
    dateRangeIdx: index('idx_staff_leave_dates').on(table.startDate, table.endDate),
})
);
export type StaffLeave = typeof staffLeave.$inferSelect;
export type StaffLeaveInsert = typeof staffLeave.$inferInsert;

// Relations 

export const staffRelations = relations(staff, ({ one, many }) => ({
    user: one(user, {
        fields: [staff.userId],
        references: [user.id],
    }),
    schedules: many(staffSchedule),
    leaves: many(staffLeave),
    barberServices: many(barberServices),
}))

export const staffScheduleRelations = relations(staffSchedule, ({ one }) => ({
    staff: one(staff, {
        fields: [staffSchedule.staffId],
        references: [staff.id],
    })
}))

export const staffLeaveRelations = relations(staffLeave, ({ one }) => ({
    staff: one(staff, {
        fields: [staffLeave.staffId],
        references: [staff.id]
    }),
    approvedBy: one(staff, {
        fields: [staffLeave.approvedBy],
        references: [staff.id],
        relationName: "approver",
    }),
    replacement: one(staff, {
        fields: [staffLeave.replacementStaffId],
        references: [staff.id],
        relationName: "replacement",
    })
}));