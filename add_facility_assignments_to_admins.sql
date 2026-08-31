-- Add facility assignment to existing admins table
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS facility_assigned VARCHAR(100);

-- Facilities catalog
CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT
);

INSERT INTO facilities (name, description)
VALUES
  ('Computer Laboratory', 'SP 203, SP 204, SP 205'),
  ('Science & Physics Lab', 'OLC 206, FLC 212, FLC 213'),
  ('Tertiary Classroom', 'MM 101-111, MM 201-203, MM 301-307'),
  ('Hotel Restaurant Management', 'Restaurant, Event Venue, Hotel'),
  ('Gymnasium', 'Main Gymnasium')
ON CONFLICT (name) DO NOTHING;

-- Rooms linked to facility
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_name VARCHAR(100) NOT NULL,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'Available',
  time_start VARCHAR(50),
  time_end VARCHAR(50),
  department VARCHAR(100),
  course VARCHAR(100),
  students INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed assigned facility data for admin accounts
UPDATE admins
SET facility_assigned = 'Computer Laboratory'
WHERE username = 'admin1';

UPDATE admins
SET facility_assigned = 'Science & Physics Lab'
WHERE username = 'admin2';

UPDATE admins
SET facility_assigned = 'Tertiary Classroom'
WHERE username = 'admin3';

UPDATE admins
SET facility_assigned = 'Hotel Restaurant Management'
WHERE username = 'admin4';

UPDATE admins
SET facility_assigned = 'Gymnasium'
WHERE username = 'admin5';

-- Remove demo accounts no longer used
DELETE FROM admins
WHERE username IN ('jgabriel', 'msantos');

-- Seed new admin accounts
INSERT INTO admins (username, fullname, email, password_hash, facility_assigned, status)
VALUES
  ('admin1', 'Admin One', 'admin1@faciltrack.school', 'ChangeMe123!', 'Computer Laboratory', 'active'),
  ('admin2', 'Admin Two', 'admin2@faciltrack.school', 'ChangeMe123!', 'Science & Physics Lab', 'active'),
  ('admin3', 'Admin Three', 'admin3@faciltrack.school', 'ChangeMe123!', 'Tertiary Classroom', 'active'),
  ('admin4', 'Admin Four', 'admin4@faciltrack.school', 'ChangeMe123!', 'Hotel Restaurant Management', 'active'),
  ('admin5', 'Admin Five', 'admin5@faciltrack.school', 'ChangeMe123!', 'Gymnasium', 'active')
ON CONFLICT (username) DO UPDATE
SET fullname = EXCLUDED.fullname,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    facility_assigned = EXCLUDED.facility_assigned,
    status = EXCLUDED.status;
