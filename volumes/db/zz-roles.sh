#!/bin/bash
# Sync the authenticator & supabase_admin role passwords with POSTGRES_PASSWORD.
# The supabase/postgres image creates these roles with its own defaults.
# This runs on first DB init only.

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  ALTER ROLE authenticator WITH PASSWORD '${POSTGRES_PASSWORD}';
  ALTER ROLE supabase_admin WITH PASSWORD '${POSTGRES_PASSWORD}';
EOSQL
