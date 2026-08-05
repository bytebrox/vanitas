ALTER TABLE "orders" ADD COLUMN "refund_checked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payouts" ADD COLUMN "kind" text DEFAULT 'sale' NOT NULL;--> statement-breakpoint
ALTER TABLE "payouts" ADD COLUMN "recipient" text;