-- Adds the ADMIN role to the users.role check constraint.
--
-- Hibernate's ddl-auto=update creates check constraints for enum columns but never
-- alters an existing one, so a database created before ADMIN existed will reject it.
-- A database created fresh from the current entities already has the correct
-- constraint and does not need this script.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('NORMAL', 'DISABLED', 'PRO', 'PREMIUM', 'ULTIMATE', 'ADMIN'));
