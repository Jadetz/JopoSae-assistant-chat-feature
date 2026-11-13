-- Migration 001: dashboard admins and their login sessions (stage 2).
-- Apply once with: psql -v ON_ERROR_STOP=1 -f migrations/001_admin_auth.sql.
-- The whole file is one transaction: if any statement fails, nothing is created.

BEGIN;

CREATE TYPE admin_role AS ENUM ('owner', 'engineer');

CREATE TABLE admins(
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL UNIQUE CHECK(email = lower(email)),
    name text,
    role admin_role NOT NULL,
    google_sub text UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_login_at timestamptz,
    revoked_at timestamptz
);

CREATE TABLE admin_sessions(
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id integer NOT NULL REFERENCES admins (id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
);

CREATE INDEX admin_sessions_admin_id_idx ON admin_sessions (admin_id);

INSERT INTO public.schema_migrations (version)
VALUES ('001');

COMMIT;