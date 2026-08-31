-- Super Admin Table
CREATE TABLE IF NOT EXISTS super_admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  fullname TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  title TEXT DEFAULT 'Super Admin',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_super_admins_email ON super_admins(email);
CREATE INDEX IF NOT EXISTS idx_super_admins_username ON super_admins(username);
CREATE INDEX IF NOT EXISTS idx_super_admins_status ON super_admins(status);

-- Admin Table (admin1-5)
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  fullname TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  facilities_assign TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_facilities ON admins(facilities_assign);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  student_id TEXT NOT NULL,
  accountability_name TEXT NOT NULL,
  department TEXT NOT NULL,
  grade_course_year TEXT NOT NULL,
  phone_no TEXT NOT NULL,
  date_filed DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_needed DATE NOT NULL,
  time_needed TEXT NOT NULL,
  facility TEXT NOT NULL,
  assigned_room TEXT,
  subject TEXT NOT NULL,
  total_students INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_facility ON reservations(facility);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_reservations_student_id ON reservations(student_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date_needed ON reservations(date_needed);

-- Seed Super Admin
INSERT INTO super_admins (email, fullname, username, password, title, status)
VALUES (
  'superadmin@school.edu',
  'Rommel Paulite',
  'superadmin',
  '1f5b2e8dfd2e876e479c3922e167b48e3512b1aac087cb879e9a883e736d3d5797ece20e23d57c88e56ed1ee268d5f44ee40ff2584767d9cfc392a4081d2f070',
  'Super Admin',
  'active'
)
ON CONFLICT(username) DO UPDATE SET
  email = excluded.email,
  fullname = excluded.fullname,
  password = excluded.password,
  title = excluded.title,
  status = excluded.status,
  updated_at = CURRENT_TIMESTAMP;

-- Seed 5 Admin Accounts
INSERT INTO admins (email, fullname, username, password, facilities_assign, status)
VALUES
  ('admin1@school.edu', 'Admin One', 'admin1', 'cf2974623263087860e2a8e6a6376665e8416f4eb5c462e6c1e98a673a6a996ebec9b4aa390f3f7b0cfd24e6fd72be3334e6766c28f234fb540ea4aa44532c40', 'Computer Laboratory', 'active'),
  ('admin2@school.edu', 'Admin Two', 'admin2', 'cf2974623263087860e2a8e6a6376665e8416f4eb5c462e6c1e98a673a6a996ebec9b4aa390f3f7b0cfd24e6fd72be3334e6766c28f234fb540ea4aa44532c40', 'Science & Physics Lab', 'active'),
  ('admin3@school.edu', 'Admin Three', 'admin3', 'cf2974623263087860e2a8e6a6376665e8416f4eb5c462e6c1e98a673a6a996ebec9b4aa390f3f7b0cfd24e6fd72be3334e6766c28f234fb540ea4aa44532c40', 'Tertiary Classroom', 'active'),
  ('admin4@school.edu', 'Admin Four', 'admin4', 'cf2974623263087860e2a8e6a6376665e8416f4eb5c462e6c1e98a673a6a996ebec9b4aa390f3f7b0cfd24e6fd72be3334e6766c28f234fb540ea4aa44532c40', 'Hotel Restaurant Management', 'active'),
  ('admin5@school.edu', 'Admin Five', 'admin5', 'cf2974623263087860e2a8e6a6376665e8416f4eb5c462e6c1e98a673a6a996ebec9b4aa390f3f7b0cfd24e6fd72be3334e6766c28f234fb540ea4aa44532c40', 'Gymnasium', 'active')
ON CONFLICT(username) DO UPDATE SET
  email = excluded.email,
  fullname = excluded.fullname,
  password = excluded.password,
  facilities_assign = excluded.facilities_assign,
  status = excluded.status,
  updated_at = CURRENT_TIMESTAMP;
