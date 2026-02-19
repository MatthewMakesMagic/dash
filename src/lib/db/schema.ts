import {
  pgTable,
  uuid,
  text,
  real,
  jsonb,
  timestamp,
  date,
  integer,
} from "drizzle-orm/pg-core";

export const captures = pgTable("captures", {
  id: uuid("id").defaultRandom().primaryKey(),
  transcript: text("transcript").notNull(),
  mode: text("mode").notNull(),
  confidence: real("confidence"),
  summary: text("summary"),
  proposedAction: text("proposed_action"),
  structuredData: jsonb("structured_data"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  captureId: uuid("capture_id").references(() => captures.id),
  title: text("title").notNull(),
  dueDate: date("due_date"),
  priority: text("priority").default("medium").notNull(),
  project: text("project"),
  status: text("status").default("todo").notNull(),
  recurrence: text("recurrence"),
  recurrenceEnd: date("recurrence_end"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const reflections = pgTable("reflections", {
  id: uuid("id").defaultRandom().primaryKey(),
  captureId: uuid("capture_id").references(() => captures.id),
  summary: text("summary").notNull(),
  mood: text("mood"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  captureId: uuid("capture_id").references(() => captures.id),
  title: text("title").notNull(),
  timeframe: text("timeframe"),
  measurable: text("measurable"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
