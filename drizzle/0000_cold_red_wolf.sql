CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deal_id" uuid,
	"lead_id" uuid,
	"user_id" uuid,
	"type" text NOT NULL,
	"body" text,
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"lead_id" uuid,
	"stage_id" uuid,
	"owner_id" uuid,
	"title" text NOT NULL,
	"value" numeric(12, 2),
	"expected_close" date,
	"status" text DEFAULT 'open',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"owner_id" uuid,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"source" text,
	"status" text DEFAULT 'new',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'member' NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activities_deal" ON "activities" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "idx_deals_tenant" ON "deals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_deals_stage" ON "deals" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "idx_leads_tenant" ON "leads" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_tenant_email_idx" ON "users" USING btree ("tenant_id","email");