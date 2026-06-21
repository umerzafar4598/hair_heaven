import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { staff } from "./staff";
import { relations } from "drizzle-orm";


export const minStaffLevelEnum = pgEnum("min_staff_level", ["junior", "senior", "specialist", "master"])
export const proficiencyLevelEnum = pgEnum("proficiency_level", ["beginner", "intermediate", "advanced", "expert"])


export const serviceCategories = pgTable("service_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    image: text("image"),
    icon: text("icon"),
    displayOrder: integer("display_order").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    activeIdx: index('idx_service_categories_active').on(table.isActive),
})
);
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type ServiceCategoryInsert = typeof serviceCategories.$inferInsert;

export const services = pgTable("services", {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
        .notNull()
        .references(() => serviceCategories.id, { onDelete: "restrict" }),
    // Service details
    name: text('name').notNull(),
    description: text('description'),
    image: text('image'), // Cloudinary URL
    // Duration and pricing
    duration: integer('duration').notNull(), // in minutes
    basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
    // Service characteristics
    requiresPreparation: boolean('requires_preparation').default(false),
    preparationTime: integer('preparation_time').default(0),
    // Staff requirements
    minStaffLevel: minStaffLevelEnum('min_staff_level').default('junior'),
    // Inventory requirements
    requiredInventory: jsonb('required_inventory'), // Array of {itemId, quantity}
    // Display settings
    displayOrder: integer('display_order').default(0),
    isActive: boolean('is_active').default(true),
    isPopular: boolean('is_popular').default(false),
    isNewService: boolean('is_new_service').default(false),
    // Tracking
    totalServiceCount: integer('total_service_count').default(0),
    averageRating: numeric('average_rating', { precision: 3, scale: 2 }).default('5.00'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    categoryIdx: index('idx_services_category').on(table.categoryId),
    activeIdx: index('idx_services_active').on(table.isActive),
})
);
export type Service = typeof services.$inferSelect;
export type ServiceInsert = typeof services.$inferInsert;

export const barberServices = pgTable("barber_services", {
    id: uuid("id").primaryKey().defaultRandom(),
    staffId: uuid("staff_id")
        .notNull().
        references(() => staff.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
        .notNull()
        .references(() => services.id, { onDelete: "cascade" }),
    // Customization per barber
    durationOverride: integer('duration_override'), // Custom duration
    priceOverride: numeric('price_override', { precision: 10, scale: 2 }), // Custom price
    // Expertise level
    isSpecialty: boolean('is_specialty').default(false), // Premium service
    proficiencyLevel: proficiencyLevelEnum('proficiency_level'),
    // Performance metrics
    completedCount: integer('completed_count').default(0),
    averageRating: numeric('average_rating', { precision: 3, scale: 2 }).default('5.00'),
    // Availability
    isAvailable: boolean('is_available').default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    uniqueStaffService: unique('uk_barber_services').on(table.staffId, table.serviceId),
    staffIdx: index('idx_barber_services_staff').on(table.staffId),
    serviceIdx: index('idx_barber_services_service').on(table.serviceId),
})
);

export type BarberService = typeof barberServices.$inferSelect;
export type BarberServiceInsert = typeof barberServices.$inferInsert;

// Relations

export const serviceCategoryRelations = relations(serviceCategories, ({ many }) => ({
    services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
    category: one(serviceCategories, {
        fields: [services.categoryId],
        references: [serviceCategories.id],
    }),
    barberServices: many(barberServices),
}));

export const barberServicesRelations = relations(barberServices, ({ one }) => ({
    staff: one(staff, {
        fields: [barberServices.staffId],
        references: [staff.id],
    }),
    service: one(services, {
        fields: [barberServices.serviceId],
        references: [services.id],
    }),
}));
