-- Perf: supporting indexes for dashboard navigation queries.
-- Purely additive and idempotent (IF NOT EXISTS). No tables altered,
-- no data touched. Safe to apply with `prisma migrate deploy` or psql.
--
-- NOTE: this repo previously had no prisma/migrations history (schema was
-- applied via `prisma db push`). On existing databases prefer
-- `prisma db push` to converge, or baseline this migration before deploy.
-- The @@unique constraints in schema.prisma (Domain[userId,name],
-- Customer[domainId,email], Bookings[domainId,date,slot]) are enforced by
-- `db push`; they are intentionally NOT added here so this migration can
-- never fail on pre-existing duplicate rows.

CREATE INDEX IF NOT EXISTS "Domain_userId_idx" ON "Domain"("userId");
CREATE INDEX IF NOT EXISTS "HelpDesk_domainId_idx" ON "HelpDesk"("domainId");
CREATE INDEX IF NOT EXISTS "FilterQuestions_domainId_idx" ON "FilterQuestions"("domainId");
CREATE INDEX IF NOT EXISTS "CustomerResponses_customerId_idx" ON "CustomerResponses"("customerId");
CREATE INDEX IF NOT EXISTS "Customer_domainId_idx" ON "Customer"("domainId");
CREATE INDEX IF NOT EXISTS "ChatRoom_customerId_idx" ON "ChatRoom"("customerId");
CREATE INDEX IF NOT EXISTS "ChatRoom_createdAt_idx" ON "ChatRoom"("createdAt");
CREATE INDEX IF NOT EXISTS "ChatRoom_customerId_createdAt_idx" ON "ChatRoom"("customerId", "createdAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_chatRoomId_idx" ON "ChatMessage"("chatRoomId");
CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_chatRoomId_createdAt_idx" ON "ChatMessage"("chatRoomId", "createdAt");
CREATE INDEX IF NOT EXISTS "Bookings_domainId_idx" ON "Bookings"("domainId");
CREATE INDEX IF NOT EXISTS "Bookings_customerId_idx" ON "Bookings"("customerId");
CREATE INDEX IF NOT EXISTS "Bookings_date_idx" ON "Bookings"("date");
CREATE INDEX IF NOT EXISTS "Campaign_userId_idx" ON "Campaign"("userId");
CREATE INDEX IF NOT EXISTS "Product_domainId_idx" ON "Product"("domainId");
