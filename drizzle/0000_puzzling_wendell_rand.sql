CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show');--> statement-breakpoint
CREATE TYPE "public"."booking_source" AS ENUM('online', 'phone', 'walk-in', 'referral');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'online', 'bank_transfer', 'easypaisa', 'jazzcash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'partial', 'completed', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."reminder_channel" AS ENUM('sms', 'email', 'whatsapp', 'all');--> statement-breakpoint
CREATE TYPE "public"."customer_segment" AS ENUM('new', 'regular', 'vip', 'inactive', 'at_risk');--> statement-breakpoint
CREATE TYPE "public"."hair_type" AS ENUM('straight', 'wavy', 'curly', 'coily');--> statement-breakpoint
CREATE TYPE "public"."loyalty_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."preferred_contact_method" AS ENUM('sms', 'email', 'call', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."scalp_type" AS ENUM('dry', 'itchy', 'sensitive', 'flaky', 'healthy');--> statement-breakpoint
CREATE TYPE "public"."skin_type" AS ENUM('oily', 'dry', 'combination', 'sensitive', 'normal');--> statement-breakpoint
CREATE TYPE "public"."min_staff_level" AS ENUM('junior', 'senior', 'specialist', 'master');--> statement-breakpoint
CREATE TYPE "public"."proficiency_level" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('active', 'inactive', 'onleave', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."leave_type" AS ENUM('sick_leave', 'casual_leave', 'annual_leave', 'emergency_leave');--> statement-breakpoint
CREATE TYPE "public"."schedule_type" AS ENUM('working', 'off', 'partial', 'half_day', 'emergency_off');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'manager', 'barber', 'stylist', 'receptionist');--> statement-breakpoint
CREATE TYPE "public"."2FA_method" AS ENUM('sms', 'email', 'authenticator');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('customer', 'staff', 'owner');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"previous_status" text,
	"new_status" text NOT NULL,
	"changed_fields" jsonb,
	"changed_by" uuid,
	"change_reason" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointment_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"services_performed" text NOT NULL,
	"products_used" jsonb,
	"hair_type" text,
	"skin_type" text,
	"scalp" text,
	"style_applied" text,
	"style_photos" jsonb,
	"style_code" text,
	"product_recommendations" jsonb,
	"next_appointment_recommendation" text,
	"maintenance_instructions" text,
	"issues_found" text,
	"issues_resolved" boolean DEFAULT false,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "appointment_notes_appointment_id_unique" UNIQUE("appointment_id"),
	CONSTRAINT "uk_appointment_notes" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "appointment_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"service_name" text NOT NULL,
	"service_price" numeric(10, 2) NOT NULL,
	"service_duration" integer NOT NULL,
	"quantity" integer DEFAULT 1,
	"line_total" numeric(10, 2) NOT NULL,
	"notes" text,
	"sequence_order" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled',
	"online" "booking_source",
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"duration" integer NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"discount_reason" text,
	"tax" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending',
	"payment_method" "payment_method",
	"customer_notes" text,
	"staff_notes" text,
	"reminder_sent" boolean DEFAULT false,
	"reminder_sent_at" timestamp with time zone,
	"reminder_channel" "reminder_channel",
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancel_reason" text,
	"loyalty_points_earned" integer DEFAULT 0,
	"loyalty_points_redeemed" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "loyalty_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"appointment_id" uuid,
	"type" text NOT NULL,
	"points" integer NOT NULL,
	"description" text,
	"reference" text,
	"redemption_for" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid,
	"customer_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'PKR',
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"method" "payment_method" NOT NULL,
	"transaction_id" text,
	"receipt_number" text,
	"reference" text,
	"description" text,
	"metadata" jsonb,
	"gateway_response" jsonb,
	"gateway_error" text,
	"refunded_amount" numeric(12, 2) DEFAULT '0',
	"refund_reason" text,
	"refunded_at" timestamp with time zone,
	"refund_transaction_id" text,
	"processed_at" timestamp with time zone,
	"processed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id"),
	CONSTRAINT "payments_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"staff_id" uuid,
	"overall_rating" integer NOT NULL,
	"service_quality_rating" integer,
	"cleanliness_rating" integer,
	"hygiene_rating" integer,
	"communication_rating" integer,
	"value_for_money_rating" integer,
	"professionalism_rating" integer,
	"comment" text,
	"would_recommend" boolean,
	"photos" jsonb,
	"is_published" boolean DEFAULT true,
	"is_verified" boolean DEFAULT true,
	"flagged" boolean DEFAULT false,
	"flag_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "reviews_appointment_id_unique" UNIQUE("appointment_id"),
	CONSTRAINT "uk_reviews_appointment" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"avatar" text,
	"preferred_contact_method" "preferred_contact_method" DEFAULT 'sms',
	"enable_reminders" boolean DEFAULT true,
	"enable_promotions" boolean DEFAULT true,
	"enable_newsletters" boolean DEFAULT false,
	"gender" text DEFAULT 'male',
	"date_of_birth" date,
	"occupation" text,
	"address" text,
	"city" text,
	"area" text,
	"preferred_staff_id" uuid,
	"preferred_services" jsonb,
	"hair_type" "hair_type",
	"hair_color" text,
	"skin_type" "skin_type",
	"scalp_type" "scalp_type",
	"allergies" jsonb,
	"total_appointments" integer DEFAULT 0,
	"completed_appointments" integer DEFAULT 0,
	"cancelled_appointments" integer DEFAULT 0,
	"no_show_count" integer DEFAULT 0,
	"total_spent" numeric(12, 2) DEFAULT '0',
	"average_spend" numeric(10, 2) DEFAULT '0',
	"last_appointment" timestamp with time zone,
	"loyalty_points" integer DEFAULT 0,
	"lifetime_points" integer DEFAULT 0,
	"loyalty_tier" "loyalty_tier" DEFAULT 'bronze',
	"customer_segment" "customer_segment" DEFAULT 'regular',
	"notes" text,
	"personal_notes" text,
	"is_blacklisted" boolean DEFAULT false,
	"blacklist_reason" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "customers_email_unique" UNIQUE("email"),
	CONSTRAINT "uk_customers_phone" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "inventory_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"sku" text,
	"barcode" text,
	"gtin" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"unit" text DEFAULT 'piece' NOT NULL,
	"reorder_level" integer DEFAULT 5 NOT NULL,
	"reorder_quantity" integer DEFAULT 10 NOT NULL,
	"cost_price" numeric(10, 2) NOT NULL,
	"selling_price" numeric(10, 2),
	"wholesale_price" numeric(10, 2),
	"supplier_id" uuid,
	"supplier_code" text,
	"last_restock_date" date,
	"image" text,
	"expiry_date" date,
	"batch_number" text,
	"is_active" boolean DEFAULT true,
	"usage_type" text DEFAULT 'used_in_service',
	"total_inventory_cost" numeric(12, 2) GENERATED ALWAYS AS (quantity * cost_price) STORED,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "inventory_products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "inventory_products_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_product_id" uuid NOT NULL,
	"appointment_id" uuid,
	"purchase_order_id" uuid,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"before_quantity" integer NOT NULL,
	"after_quantity" integer NOT NULL,
	"unit_price" numeric(10, 2),
	"total_cost" numeric(12, 2),
	"reference" text,
	"notes" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"inventory_product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit" text NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"received_quantity" integer DEFAULT 0,
	"sequence_order" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_number" text NOT NULL,
	"supplier_id" uuid NOT NULL,
	"order_date" date NOT NULL,
	"expected_delivery_date" date,
	"actual_delivery_date" date,
	"status" text DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"tax" numeric(12, 2) DEFAULT '0',
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(12, 2) NOT NULL,
	"payment_status" text DEFAULT 'pending',
	"payment_method" text,
	"payment_date" timestamp with time zone,
	"notes" text,
	"internal_notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "purchase_orders_po_number_unique" UNIQUE("po_number"),
	CONSTRAINT "uk_po_number" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"website" text,
	"contact_person" text,
	"contact_email" text,
	"contact_phone" text,
	"address" text NOT NULL,
	"city" text,
	"category" text,
	"payment_terms" text,
	"rating" numeric(3, 2) DEFAULT '5.00',
	"is_preferred" boolean DEFAULT false,
	"bank_account_name" text,
	"bank_account_number" text,
	"bank_code" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "barber_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"duration_override" integer,
	"price_override" numeric(10, 2),
	"is_specialty" boolean DEFAULT false,
	"proficiency_level" "proficiency_level",
	"completed_count" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT '5.00',
	"is_available" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uk_barber_services" UNIQUE("staff_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image" text,
	"icon" text,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image" text,
	"duration" integer NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"requires_preparation" boolean DEFAULT false,
	"preparation_time" integer DEFAULT 0,
	"min_staff_level" "min_staff_level" DEFAULT 'junior',
	"required_inventory" jsonb,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_popular" boolean DEFAULT false,
	"is_new_service" boolean DEFAULT false,
	"total_service_count" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT '5.00',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"staff_id" uuid,
	"staff_email" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"description" text,
	"severity" text DEFAULT 'info',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'PKR',
	"date" date NOT NULL,
	"payment_method" text,
	"receipt" text,
	"receipt_number" text,
	"vendor_name" text,
	"budget_category" text,
	"notes" text,
	"internal_notes" text,
	"requires_approval" boolean DEFAULT false,
	"approved_by" uuid,
	"approval_date" timestamp with time zone,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image" text NOT NULL,
	"title" text,
	"description" text,
	"alt_text" text,
	"category" text DEFAULT 'general',
	"staff_id" uuid,
	"display_order" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"likes" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_full_day" boolean DEFAULT true,
	"start_time" text,
	"end_time" text,
	"type" text DEFAULT 'holiday',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "holidays_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending',
	"scheduled_for" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"attempt_count" integer DEFAULT 0,
	"last_attempt_at" timestamp with time zone,
	"error_message" text,
	"related_entity_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promotion_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promotion_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image" text,
	"code" text,
	"type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"max_discount" numeric(10, 2),
	"minimum_spend" numeric(10, 2),
	"applicable_services" jsonb,
	"valid_from" date NOT NULL,
	"valid_until" date NOT NULL,
	"valid_days" jsonb,
	"max_uses" integer,
	"usage_count" integer DEFAULT 0,
	"max_uses_per_customer" integer,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "promotions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "shop_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"website" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"area" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(10, 8),
	"logo" text,
	"favicon" text,
	"cover_image" text,
	"business_hours" jsonb DEFAULT '{"monday":{"isOpen":true,"open":"09:00","close":"18:00","lunch":{"start":"13:00","end":"14:00"}},"tuesday":{"isOpen":true,"open":"09:00","close":"18:00","lunch":{"start":"13:00","end":"14:00"}},"wednesday":{"isOpen":true,"open":"09:00","close":"18:00","lunch":{"start":"13:00","end":"14:00"}},"thursday":{"isOpen":true,"open":"09:00","close":"18:00","lunch":{"start":"13:00","end":"14:00"}},"friday":{"isOpen":true,"open":"09:00","close":"18:00","lunch":{"start":"13:00","end":"14:00"}},"saturday":{"isOpen":true,"open":"10:00","close":"17:00","lunch":{"start":"13:00","end":"14:00"}},"sunday":{"isOpen":true,"open":"10:00","close":"17:00","lunch":{"start":"13:00","end":"14:00"}}}',
	"time_slot_duration" integer DEFAULT 30,
	"buffer_time" integer DEFAULT 5,
	"max_advance_booking" integer DEFAULT 60,
	"min_advance_booking" integer DEFAULT 15,
	"enable_online_booking" boolean DEFAULT true,
	"enable_online_payment" boolean DEFAULT true,
	"enable_appointment_reminders" boolean DEFAULT true,
	"enable_customer_reviews" boolean DEFAULT true,
	"enable_loyalty_program" boolean DEFAULT true,
	"enable_inventory_tracking" boolean DEFAULT true,
	"currency" text DEFAULT 'PKR',
	"tax_percentage" numeric(5, 2) DEFAULT '0',
	"tax_type" text DEFAULT 'inclusive',
	"fbr_enabled" boolean DEFAULT false,
	"fbr_taxpayer_id" text,
	"reminder_hours_before" integer DEFAULT 24,
	"confirmation_method" text DEFAULT 'sms',
	"timezone" text DEFAULT 'Asia/Karachi',
	"date_format" text DEFAULT 'DD/MM/YYYY',
	"language" text DEFAULT 'en',
	"points_per_pkr" numeric(5, 2) DEFAULT '1',
	"points_expiry_months" integer DEFAULT 12,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role" "role" NOT NULL,
	"bio" text,
	"specialties" jsonb,
	"languages" jsonb,
	"experience" integer,
	"cnic" text,
	"cnic_verified" boolean DEFAULT false,
	"tax_id" text,
	"ntn" text,
	"hire_date" date,
	"employment_status" "employment_status" DEFAULT 'active',
	"base_salary" numeric(10, 2),
	"commission_percentage" numeric(5, 2),
	"bonus_structure" jsonb,
	"bank_name" text,
	"bank_account_number" text,
	"bank_iban" text,
	"total_appointments" integer DEFAULT 0,
	"completed_appointments" integer DEFAULT 0,
	"cancelled_appointments" integer DEFAULT 0,
	"no_show_count" integer DEFAULT 0,
	"total_earnings" numeric(12, 2) DEFAULT '0',
	"average_rating" numeric(3, 2) DEFAULT '5.00',
	"total_reviews" integer DEFAULT 0,
	"default_start_time" text,
	"default_end_time" text,
	"certificate_url" text,
	"license_url" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "staff_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "staff_cnic_unique" UNIQUE("cnic"),
	CONSTRAINT "uk_staff_user" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "staff_leave" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" integer NOT NULL,
	"leaveType" "leave_type" NOT NULL,
	"reason" text NOT NULL,
	"document_url" text,
	"status" text DEFAULT 'pending',
	"approved_by" uuid,
	"approval_date" timestamp with time zone,
	"rejection_reason" text,
	"replacement_staff_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staff_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"date" date NOT NULL,
	"day_of_week" integer NOT NULL,
	"schedule_type" "schedule_type" DEFAULT 'working' NOT NULL,
	"start_time" text,
	"end_time" text,
	"break_start_time" text,
	"break_end_time" text,
	"max_appointments" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uk_staff_schedule_date" UNIQUE("staff_id","date")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_type" "user_type" NOT NULL,
	"phone" text,
	"phone_verified" boolean,
	"2FA_enabled" boolean DEFAULT false,
	"2FA_method" "2FA_method",
	"preferred_lang" text DEFAULT 'en',
	"timezone" text DEFAULT 'Asia/Karachi',
	"notification_pref" jsonb DEFAULT '{"emailNotifications":true,"smsNotifications":true,"pushNotifications":false,"marketingEmails":true,"appointmentReminders":true,"promotionNotifications":true}',
	"is_active" boolean DEFAULT true,
	"is_suspended" boolean DEFAULT false,
	"suspension_reason" text,
	"last_active_at" timestamp with time zone,
	"ip_address_list" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "uk_user_profiles_user" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_history" ADD CONSTRAINT "appointment_history_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_history" ADD CONSTRAINT "appointment_history_changed_by_staff_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_notes" ADD CONSTRAINT "appointment_notes_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_notes" ADD CONSTRAINT "appointment_notes_recorded_by_staff_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_cancelled_by_staff_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_staff_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_updated_by_staff_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_recorded_by_staff_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_staff_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_preferred_staff_id_staff_id_fk" FOREIGN KEY ("preferred_staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_products" ADD CONSTRAINT "inventory_products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_inventory_product_id_inventory_products_id_fk" FOREIGN KEY ("inventory_product_id") REFERENCES "public"."inventory_products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_recorded_by_staff_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_inventory_product_id_inventory_products_id_fk" FOREIGN KEY ("inventory_product_id") REFERENCES "public"."inventory_products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_staff_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_staff_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recorded_by_staff_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_services" ADD CONSTRAINT "promotion_services_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_created_by_staff_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_leave" ADD CONSTRAINT "staff_leave_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_leave" ADD CONSTRAINT "staff_leave_approved_by_staff_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_leave" ADD CONSTRAINT "staff_leave_replacement_staff_id_staff_id_fk" FOREIGN KEY ("replacement_staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_schedule" ADD CONSTRAINT "staff_schedule_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_appointment_history_appointment" ON "appointment_history" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "idx_appointment_history_status" ON "appointment_history" USING btree ("new_status");--> statement-breakpoint
CREATE INDEX "idx_appointment_services_appointment" ON "appointment_services" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "idx_appointment_services_service" ON "appointment_services" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_customer" ON "appointments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_staff" ON "appointments" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_start_time" ON "appointments" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_appointments_status" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_appointments_payment_status" ON "appointments" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_appointments_staff_time" ON "appointments" USING btree ("staff_id","start_time");--> statement-breakpoint
CREATE INDEX "idx_loyalty_transactions_customer" ON "loyalty_transactions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_loyalty_transactions_type" ON "loyalty_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_payments_customer" ON "payments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_payments_appointment" ON "payments" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_transaction" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_customer" ON "reviews" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_staff" ON "reviews" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_customers_user" ON "customers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_customers_preferred_staff" ON "customers" USING btree ("preferred_staff_id");--> statement-breakpoint
CREATE INDEX "idx_customers_segment" ON "customers" USING btree ("customer_segment");--> statement-breakpoint
CREATE INDEX "idx_inventory_sku" ON "inventory_products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_inventory_category" ON "inventory_products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_inventory_supplier" ON "inventory_products" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_quantity" ON "inventory_products" USING btree ("quantity");--> statement-breakpoint
CREATE INDEX "idx_inv_trans_product" ON "inventory_transactions" USING btree ("inventory_product_id");--> statement-breakpoint
CREATE INDEX "idx_inv_trans_type" ON "inventory_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_inv_trans_appointment" ON "inventory_transactions" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "idx_poi_po" ON "purchase_order_items" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "idx_poi_product" ON "purchase_order_items" USING btree ("inventory_product_id");--> statement-breakpoint
CREATE INDEX "idx_po_supplier" ON "purchase_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_po_status" ON "purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_suppliers_email" ON "suppliers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_barber_services_staff" ON "barber_services" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_barber_services_service" ON "barber_services" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "idx_service_categories_active" ON "service_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_services_category" ON "services" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_services_active" ON "services" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_staff" ON "audit_logs" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_expenses_date" ON "expenses" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_expenses_category" ON "expenses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_gallery_category" ON "gallery" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_gallery_published" ON "gallery" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_holidays_date" ON "holidays" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_notifications_staff" ON "notifications" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_status" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_promotion_services_promotion" ON "promotion_services" USING btree ("promotion_id");--> statement-breakpoint
CREATE INDEX "idx_promotions_code" ON "promotions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_promotions_active" ON "promotions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_staff_role" ON "staff" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_staff_status" ON "staff" USING btree ("employment_status");--> statement-breakpoint
CREATE INDEX "idx_staff_cnic" ON "staff" USING btree ("cnic");--> statement-breakpoint
CREATE INDEX "idx_staff_leave_staff" ON "staff_leave" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_staff_leave_status" ON "staff_leave" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_staff_leave_dates" ON "staff_leave" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_staff_schedule_staff" ON "staff_schedule" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_staff_schedule_date" ON "staff_schedule" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_type" ON "user_profile" USING btree ("user_type");