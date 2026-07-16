import { relations } from "drizzle-orm";
import {
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ---------- ENUMS ----------

export const sessionStatusEnum = pgEnum("session_status", [
	"pending", // matched, not yet started
	"active", // chat in progress
	"completed", // session ended normally
	"cancelled", // user or counsellor cancelled
]);

export const senderRoleEnum = pgEnum("sender_role", ["user", "counsellor"]);

// ---------- TABLES ----------

// Pseudonymous users — NO real name, NO email, NO photo. Username only.
export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	username: varchar("username", { length: 32 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Issue types: burnout, anxiety, grief, relationship stress, etc.
export const issueTags = pgTable("issue_tags", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 64 }).notNull().unique(),
});

// Licensed counsellors — display name only, no real identity linkage required for demo
export const counsellors = pgTable("counsellors", {
	id: uuid("id").primaryKey().defaultRandom(),
	displayName: varchar("display_name", { length: 64 }).notNull(),
	bio: text("bio"),
	isAvailable: integer("is_available").notNull().default(1), // 1 = available, 0 = not (simple flag for MVP)
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Many-to-many: which issues each counsellor handles
export const counsellorTags = pgTable(
	"counsellor_tags",
	{
		counsellorId: uuid("counsellor_id")
			.notNull()
			.references(() => counsellors.id, { onDelete: "cascade" }),
		issueTagId: uuid("issue_tag_id")
			.notNull()
			.references(() => issueTags.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.counsellorId, table.issueTagId] }),
	}),
);

// A booked session: user matched to counsellor for a given issue
export const sessions = pgTable("sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	counsellorId: uuid("counsellor_id")
		.notNull()
		.references(() => counsellors.id, { onDelete: "cascade" }),
	issueTagId: uuid("issue_tag_id")
		.notNull()
		.references(() => issueTags.id),
	status: sessionStatusEnum("status").notNull().default("pending"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Pre-paid session credits per user (no real payment integration for demo)
export const sessionCredits = pgTable("session_credits", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: "cascade" }),
	balance: integer("balance").notNull().default(1), // seed new users with 1 free credit for demo
});

// Chat messages within a session
export const messages = pgTable("messages", {
	id: uuid("id").primaryKey().defaultRandom(),
	sessionId: uuid("session_id")
		.notNull()
		.references(() => sessions.id, { onDelete: "cascade" }),
	senderRole: senderRoleEnum("sender_role").notNull(),
	senderId: uuid("sender_id").notNull(), // references either users.id or counsellors.id depending on senderRole
	content: text("content").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- RELATIONS (for Drizzle query API convenience) ----------

export const usersRelations = relations(users, ({ one, many }) => ({
	sessions: many(sessions),
	credits: one(sessionCredits, {
		fields: [users.id],
		references: [sessionCredits.userId],
	}),
}));

export const counsellorsRelations = relations(counsellors, ({ many }) => ({
	sessions: many(sessions),
	tags: many(counsellorTags),
}));

export const issueTagsRelations = relations(issueTags, ({ many }) => ({
	counsellorTags: many(counsellorTags),
	sessions: many(sessions),
}));

export const counsellorTagsRelations = relations(counsellorTags, ({ one }) => ({
	counsellor: one(counsellors, {
		fields: [counsellorTags.counsellorId],
		references: [counsellors.id],
	}),
	issueTag: one(issueTags, {
		fields: [counsellorTags.issueTagId],
		references: [issueTags.id],
	}),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
	counsellor: one(counsellors, {
		fields: [sessions.counsellorId],
		references: [counsellors.id],
	}),
	issueTag: one(issueTags, {
		fields: [sessions.issueTagId],
		references: [issueTags.id],
	}),
	messages: many(messages),
}));

export const sessionCreditsRelations = relations(sessionCredits, ({ one }) => ({
	user: one(users, {
		fields: [sessionCredits.userId],
		references: [users.id],
	}),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
	session: one(sessions, {
		fields: [messages.sessionId],
		references: [sessions.id],
	}),
}));
