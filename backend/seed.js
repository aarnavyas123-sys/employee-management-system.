const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ override: true });

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

async function seed() {
  console.log("🚀 Starting database rebuild and seeding...");
  
  try {
    // 1. Read and execute schema.sql
    const schemaPath = path.join(__dirname, "../docs/schema.sql");
    console.log(`Reading schema SQL from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    
    console.log("Dropping and recreating tables...");
    await pool.query(schemaSql);
    console.log("✅ Tables recreated successfully.");

    // 2. Hash passwords
    console.log("Hashing passwords for default users...");
    const hashedAdmin = await bcrypt.hash("admin", 10);
    const hashedHR = await bcrypt.hash("hr123", 10);
    const hashedManager = await bcrypt.hash("manager123", 10);
    const hashedEmployee = await bcrypt.hash("employee123", 10);

    // 3. Seed Users
    console.log("Seeding default users...");
    const usersResult = await pool.query(`
      INSERT INTO users (name, email, password, role, status) VALUES
      ('System Admin', 'admin@ems.com', $1, 'Admin', 'Active'),
      ('HR Specialist', 'hr@ems.com', $2, 'HR', 'Active'),
      ('Team Manager', 'manager@ems.com', $3, 'Manager', 'Active'),
      ('John Employee', 'employee@ems.com', $4, 'Employee', 'Active')
      RETURNING id, name, role
    `, [hashedAdmin, hashedHR, hashedManager, hashedEmployee]);
    
    const usersMap = {};
    usersResult.rows.forEach(u => {
      usersMap[u.role] = u.id;
    });
    console.log("✅ Users seeded:", usersResult.rows.map(r => r.name));

    // 4. Seed Departments
    console.log("Seeding default departments...");
    const deptResult = await pool.query(`
      INSERT INTO departments (department_name, manager_id) VALUES
      ('Engineering', $1),
      ('Human Resources', $2),
      ('Sales', NULL)
      RETURNING id, department_name
    `, [usersMap['Manager'], usersMap['HR']]);
    
    const deptMap = {};
    deptResult.rows.forEach(d => {
      deptMap[d.department_name] = d.id;
    });
    console.log("✅ Departments seeded:", deptResult.rows.map(r => r.department_name));

    // 5. Seed Employee Profiles (linking user_id correctly!)
    console.log("Seeding employee profiles...");
    const profileResult = await pool.query(`
      INSERT INTO employee_profiles (user_id, name, department_id, phone, address, designation, salary) VALUES
      ($1, 'System Admin', $5, '9999999999', '123 Admin Lane', 'System Administrator', 95000.00),
      ($2, 'HR Specialist', $6, '8888888888', '456 HR Blvd', 'HR Lead', 75000.00),
      ($3, 'Team Manager', $5, '7777777777', '789 Manager Way', 'Engineering Manager', 90000.00),
      ($4, 'John Employee', $5, '6666666666', '101 Employee Road', 'Software Engineer', 60000.00)
      RETURNING id, name
    `, [
      usersMap['Admin'],
      usersMap['HR'],
      usersMap['Manager'],
      usersMap['Employee'],
      deptMap['Engineering'],
      deptMap['Human Resources']
    ]);
    
    const profileMap = {};
    profileResult.rows.forEach(p => {
      profileMap[p.name] = p.id;
    });
    console.log("✅ Employee profiles seeded:", profileResult.rows.map(r => r.name));

    // 6. Seed Leave Types
    console.log("Seeding leave types...");
    const leaveTypesResult = await pool.query(`
      INSERT INTO leave_types (leave_name, total_days) VALUES
      ('Sick Leave', 12),
      ('Casual Leave', 12),
      ('Annual Leave', 15),
      ('Maternity Leave', 90)
      RETURNING id, leave_name, total_days
    `);
    console.log("✅ Leave types seeded:", leaveTypesResult.rows.map(r => r.leave_name));

    // 7. Seed Leave Balances for all employee profiles & leave types
    console.log("Initializing leave balances...");
    for (const profile of profileResult.rows) {
      for (const lt of leaveTypesResult.rows) {
        await pool.query(`
          INSERT INTO leave_balance (employee_id, leave_type_id, remaining_days)
          VALUES ($1, $2, $3)
        `, [profile.id, lt.id, lt.total_days]);
      }
    }
    console.log("✅ Leave balances initialized.");

    // 8. Seed Assets
    console.log("Seeding assets...");
    await pool.query(`
      INSERT INTO assets (asset_code, asset_name, asset_type, purchase_date, purchase_cost, status) VALUES
      ('LAP-001', 'MacBook Pro', 'Hardware', '2026-01-15', 1500.00, 'Available'),
      ('MON-001', 'Dell 27" Monitor', 'Hardware', '2026-02-10', 300.00, 'Available'),
      ('KEY-001', 'Logitech MX Keys', 'Accessory', '2026-03-01', 100.00, 'Available')
    `);
    console.log("✅ Assets seeded.");

    // 9. Initial Audit Log
    console.log("Creating initial system audit log...");
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, details) VALUES
      ($1, 'System Seeded', 'Database rebuilt and seeded with default structural parameters.')
    `, [usersMap['Admin']]);
    console.log("✅ Audit logs seeded.");

    console.log("\n🎉 Database Rebuilt and Seeded Successfully! ✅");
  } catch (error) {
    console.error("\n❌ Seeding Error:", error);
  } finally {
    await pool.end();
  }
}

seed();
