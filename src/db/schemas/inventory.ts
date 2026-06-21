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
    unique,
    uuid,
} from 'drizzle-orm/pg-core';
import { staff } from './staff';
import { appointments } from './appointments';
import { relations, sql } from 'drizzle-orm';


export const suppliers = pgTable(
    'suppliers',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        // Company info
        name: text('name').notNull(),
        email: text('email'),
        phone: text('phone').notNull(),
        website: text('website'),

        // Contact person
        contactPerson: text('contact_person'),
        contactEmail: text('contact_email'),
        contactPhone: text('contact_phone'),

        // Address
        address: text('address').notNull(),
        city: text('city'),

        // Details
        category: text('category'),
        // 'hair_products', 'shaving_products', 'equipment', 'supplies', 'cleaning'
        paymentTerms: text('payment_terms'), // 'cash', 'credit_30', 'credit_60'

        // Performance
        rating: numeric('rating', { precision: 3, scale: 2 }).default('5.00'),
        isPreferred: boolean('is_preferred').default(false),

        // Banking
        bankAccountName: text('bank_account_name'),
        bankAccountNumber: text('bank_account_number'),
        bankCode: text('bank_code'),

        notes: text('notes'),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        emailIdx: index('idx_suppliers_email').on(table.email),
    })
);

export type Supplier = typeof suppliers.$inferSelect;
export type SupplierInsert = typeof suppliers.$inferInsert;

export const inventoryProducts = pgTable(
    'inventory_products',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        // Product info
        name: text('name').notNull(),
        description: text('description'),
        category: text('category').notNull(),
        // SKU
        sku: text('sku').unique(),
        barcode: text('barcode').unique(),
        gtin: text('gtin'),

        // Stock
        quantity: integer('quantity').notNull().default(0),
        unit: text('unit').notNull().default('piece'),
        // 'piece', 'ml', 'gram', 'liter', 'pack', 'bottle'

        reorderLevel: integer('reorder_level').notNull().default(5),
        reorderQuantity: integer('reorder_quantity').notNull().default(10),

        // Pricing
        costPrice: numeric('cost_price', { precision: 10, scale: 2 }).notNull(),
        sellingPrice: numeric('selling_price', { precision: 10, scale: 2 }),
        wholesalePrice: numeric('wholesale_price', { precision: 10, scale: 2 }),

        // Supplier
        supplierId: uuid('supplier_id')
            .references(() => suppliers.id, { onDelete: 'set null' }),
        supplierCode: text('supplier_code'),
        lastRestockDate: date('last_restock_date'),

        // Details
        image: text('image'), // Cloudinary
        expiryDate: date('expiry_date'),
        batchNumber: text('batch_number'),

        // Status
        isActive: boolean('is_active').default(true),
        usageType: text('usage_type').default('used_in_service'),
        // 'used_in_service', 'sold_to_customer', 'both'

        // Inventory value
        totalInventoryCost: numeric('total_inventory_cost', { precision: 12, scale: 2 }).generatedAlwaysAs(
            sql`quantity * cost_price`
        ),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        skuIdx: index('idx_inventory_sku').on(table.sku),
        categoryIdx: index('idx_inventory_category').on(table.category),
        supplierIdx: index('idx_inventory_supplier').on(table.supplierId),
        quantityIdx: index('idx_inventory_quantity').on(table.quantity),
    })
);

export type InventoryProduct = typeof inventoryProducts.$inferSelect;
export type InventoryProductInsert = typeof inventoryProducts.$inferInsert;

// ============================================================
// PURCHASE ORDERS
// ============================================================

export const purchaseOrders = pgTable(
    'purchase_orders',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        // PO details
        poNumber: text('po_number').unique().notNull(),
        supplierId: uuid('supplier_id')
            .notNull()
            .references(() => suppliers.id, { onDelete: 'restrict' }),

        // Dates
        orderDate: date('order_date').notNull(),
        expectedDeliveryDate: date('expected_delivery_date'),
        actualDeliveryDate: date('actual_delivery_date'),

        // Status
        status: text('status').notNull().default('pending'),
        // 'pending', 'confirmed', 'shipped', 'delivered', 'received', 'cancelled'

        // Amounts
        subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
        tax: numeric('tax', { precision: 12, scale: 2 }).default('0'),
        shippingCost: numeric('shipping_cost', { precision: 10, scale: 2 }).default('0'),
        totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),

        // Payment
        paymentStatus: text('payment_status').default('pending'),
        // 'pending', 'partial', 'completed'
        paymentMethod: text('payment_method'),
        paymentDate: timestamp('payment_date', { withTimezone: true }),

        notes: text('notes'),
        internalNotes: text('internal_notes'),

        // Audit
        createdBy: uuid('created_by')
            .references(() => staff.id, { onDelete: 'set null' }),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        poNumberIdx: unique('uk_po_number').on(table.poNumber),
        supplierIdx: index('idx_po_supplier').on(table.supplierId),
        statusIdx: index('idx_po_status').on(table.status),
    })
);

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderInsert = typeof purchaseOrders.$inferInsert;

// ============================================================
// PURCHASE ORDER ITEMS
// ============================================================

export const purchaseOrderItems = pgTable(
    'purchase_order_items',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        purchaseOrderId: uuid('purchase_order_id')
            .notNull()
            .references(() => purchaseOrders.id, { onDelete: 'cascade' }),
        inventoryProductId: uuid('inventory_product_id')
            .notNull()
            .references(() => inventoryProducts.id, { onDelete: 'restrict' }),

        // Item details
        productName: text('product_name').notNull(),
        quantity: integer('quantity').notNull(),
        unit: text('unit').notNull(),

        // Pricing
        unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
        lineTotal: numeric('line_total', { precision: 12, scale: 2 }).notNull(),

        // Receiving
        receivedQuantity: integer('received_quantity').default(0),

        sequenceOrder: integer('sequence_order'),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        poIdx: index('idx_poi_po').on(table.purchaseOrderId),
        productIdx: index('idx_poi_product').on(table.inventoryProductId),
    })
);

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type PurchaseOrderItemInsert = typeof purchaseOrderItems.$inferInsert;

// ============================================================
// INVENTORY TRANSACTIONS
// ============================================================

export const inventoryTransactions = pgTable(
    'inventory_transactions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        inventoryProductId: uuid('inventory_product_id')
            .notNull()
            .references(() => inventoryProducts.id, { onDelete: 'restrict' }),
        appointmentId: uuid('appointment_id')
            .references(() => appointments.id, { onDelete: 'set null' }),
        purchaseOrderId: uuid('purchase_order_id')
            .references(() => purchaseOrders.id, { onDelete: 'set null' }),

        // Type
        type: text('type').notNull(),
        // 'purchase', 'usage', 'damage', 'loss', 'return', 'adjustment', 'disposal'

        // Quantities
        quantity: integer('quantity').notNull(),
        beforeQuantity: integer('before_quantity').notNull(),
        afterQuantity: integer('after_quantity').notNull(),

        // Cost info
        unitPrice: numeric('unit_price', { precision: 10, scale: 2 }),
        totalCost: numeric('total_cost', { precision: 12, scale: 2 }),

        // Details
        reference: text('reference'),
        notes: text('notes'),

        // Recording
        recordedBy: uuid('recorded_by')
            .references(() => staff.id, { onDelete: 'set null' }),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        productIdx: index('idx_inv_trans_product').on(table.inventoryProductId),
        typeIdx: index('idx_inv_trans_type').on(table.type),
        appointmentIdx: index('idx_inv_trans_appointment').on(table.appointmentId),
    })
);

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InventoryTransactionInsert = typeof inventoryTransactions.$inferInsert;

// ============================================================
// RELATIONS
// ============================================================

export const suppliersRelations = relations(suppliers, ({ many }) => ({
    inventoryProducts: many(inventoryProducts),
    purchaseOrders: many(purchaseOrders),
}));

export const inventoryProductsRelations = relations(inventoryProducts, ({ one, many }) => ({
    supplier: one(suppliers, {
        fields: [inventoryProducts.supplierId],
        references: [suppliers.id],
    }),
    transactions: many(inventoryTransactions),
    purchaseOrderItems: many(purchaseOrderItems),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
    supplier: one(suppliers, {
        fields: [purchaseOrders.supplierId],
        references: [suppliers.id],
    }),
    items: many(purchaseOrderItems),
    transactions: many(inventoryTransactions),
    createdByStaff: one(staff, {
        fields: [purchaseOrders.createdBy],
        references: [staff.id],
    }),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
        fields: [purchaseOrderItems.purchaseOrderId],
        references: [purchaseOrders.id],
    }),
    inventoryProduct: one(inventoryProducts, {
        fields: [purchaseOrderItems.inventoryProductId],
        references: [inventoryProducts.id],
    }),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
    product: one(inventoryProducts, {
        fields: [inventoryTransactions.inventoryProductId],
        references: [inventoryProducts.id],
    }),
    appointment: one(appointments, {
        fields: [inventoryTransactions.appointmentId],
        references: [appointments.id],
    }),
    purchaseOrder: one(purchaseOrders, {
        fields: [inventoryTransactions.purchaseOrderId],
        references: [purchaseOrders.id],
    }),
    recordedByStaff: one(staff, {
        fields: [inventoryTransactions.recordedBy],
        references: [staff.id],
    }),
})); 
