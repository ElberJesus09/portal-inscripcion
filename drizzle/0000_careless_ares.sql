CREATE TABLE "payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"source_key" text NOT NULL,
	"document_type" text NOT NULL,
	"document_number" text NOT NULL,
	"source" text NOT NULL,
	"voucher" text NOT NULL,
	"agency" text,
	"payment_date" date NOT NULL,
	"payment_time" text,
	"amount" numeric(12, 2),
	"student_name" text DEFAULT '' NOT NULL,
	"concept" text DEFAULT '' NOT NULL,
	"source_status" text,
	"source_row" jsonb,
	"status" text DEFAULT 'IMPORTADO' NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "payments_document_type_check" CHECK ("payments"."document_type" IN ('DNI', 'CE_CI')),
	CONSTRAINT "payments_source_check" CHECK ("payments"."source" IN ('BANCO_NACION', 'PAGALO_PE')),
	CONSTRAINT "payments_status_check" CHECK ("payments"."status" IN ('IMPORTADO', 'UTILIZADO')),
	CONSTRAINT "payments_bank_requires_agency_check" CHECK ("payments"."source" <> 'BANCO_NACION' OR "payments"."agency" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "payments_source_key_unique" ON "payments" USING btree ("source_key");--> statement-breakpoint
CREATE INDEX "payments_bank_validation_idx" ON "payments" USING btree ("document_type","document_number","payment_date","voucher","agency") WHERE "payments"."status" = 'IMPORTADO' AND "payments"."used_at" IS NULL AND "payments"."source" = 'BANCO_NACION';--> statement-breakpoint
CREATE INDEX "payments_pagalo_validation_idx" ON "payments" USING btree ("document_type","document_number","payment_date",RIGHT("voucher", 7)) WHERE "payments"."status" = 'IMPORTADO' AND "payments"."used_at" IS NULL AND "payments"."source" = 'PAGALO_PE';--> statement-breakpoint
CREATE INDEX "payments_imported_at_idx" ON "payments" USING btree ("imported_at");