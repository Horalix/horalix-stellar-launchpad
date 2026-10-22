CREATE TABLE `anonymous_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event` text NOT NULL,
	`path` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`intent` text NOT NULL,
	`name` text NOT NULL,
	`work_email` text NOT NULL,
	`organization` text NOT NULL,
	`role` text NOT NULL,
	`country` text NOT NULL,
	`message` text,
	`consent_version` text NOT NULL,
	`source_path` text NOT NULL,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer DEFAULT 1 NOT NULL
);
