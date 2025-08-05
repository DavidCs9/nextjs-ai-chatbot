-- Idempotent database creation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'chatbot_db') THEN
        CREATE DATABASE chatbot_db;
    END IF;
END
$$;

-- Create extensions and any additional setup needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add any additional initialization SQL here
-- For example, creating roles, schemas, etc.
