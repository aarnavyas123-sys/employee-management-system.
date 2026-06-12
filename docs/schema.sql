-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notification_recipients CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS asset_history CASCADE;
DROP TABLE IF EXISTS asset_allocations CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS approval_history CASCADE;
DROP TABLE IF EXISTS leave_applications CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balance CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS employee_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS employee_images CASCADE;
DROP TABLE IF EXISTS employee_profiles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table (for Auth & Role Assignment)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Employee', -- 'Admin', 'HR', 'Manager', 'Employee'
  status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Inactive', 'Suspended'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Departments table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(100) UNIQUE NOT NULL,
  manager_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employee Profiles table
CREATE TABLE employee_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  department_id INT REFERENCES departments(id) ON DELETE SET NULL,
  phone VARCHAR(20),
  address TEXT,
  designation VARCHAR(100),
  salary DECIMAL(10,2),
  remaining_leaves INT DEFAULT 24,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Skills table
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL
);

-- Create Employee Skills table (Many-to-Many join)
CREATE TABLE employee_skills (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE
);

-- Create Employee Images table
CREATE TABLE employee_images (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL
);

-- Create Leave Types table
CREATE TABLE leave_types (
  id SERIAL PRIMARY KEY,
  leave_name VARCHAR(50) NOT NULL,
  total_days INT NOT NULL
);

-- Create Leave Balance table
CREATE TABLE leave_balance (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
  leave_type_id INT REFERENCES leave_types(id) ON DELETE CASCADE,
  remaining_days INT NOT NULL,
  available_days INT DEFAULT 24
);

-- Create Leave Applications table (queried by leave controllers/cron jobs)
CREATE TABLE leave_applications (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
  leave_type_id INT REFERENCES leave_types(id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Manager Approved', 'HR Approved', 'Rejected', 'HR Rejected'
  manager_id INT REFERENCES users(id) ON DELETE SET NULL,
  hr_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Approval History table
CREATE TABLE approval_history (
  id SERIAL PRIMARY KEY,
  leave_id INT REFERENCES leave_applications(id) ON DELETE CASCADE,
  approved_by INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Attendance table (employee_id points to users(id) to match controller auth context)
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in TIMESTAMP,
  clock_out TIMESTAMP,
  status VARCHAR(20) DEFAULT 'Present', -- 'Present', 'Late', 'Absent'
  total_hours DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
);

-- Create Assets table (matches frontend and controller usage)
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  asset_code VARCHAR(100) UNIQUE NOT NULL,
  asset_name VARCHAR(150) NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  purchase_date DATE,
  purchase_cost DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'Available', -- 'Available', 'Allocated', 'Maintenance'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Asset Allocations table
CREATE TABLE asset_allocations (
  id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
  employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
  allocated_date DATE DEFAULT CURRENT_DATE,
  returned_date DATE,
  allocated_by INT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Returned'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Asset History table
CREATE TABLE asset_history (
  id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  remarks TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications table (recipient and status flattened to match queries)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NULL REFERENCES users(id) ON DELETE CASCADE, -- NULL means global (all Admin/HR/Manager)
  title VARCHAR(250) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notification Recipients (Many-to-Many table kept for constraint legacy if any)
CREATE TABLE notification_recipients (
  id SERIAL PRIMARY KEY,
  notification_id INT REFERENCES notifications(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Audit Logs table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
