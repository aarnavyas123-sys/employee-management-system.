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
  console.log("🚀 Starting rich demo database seeding...");
  
  try {
    // 1. Read and execute schema.sql to clean slate
    const schemaPath = path.join(__dirname, "../docs/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    
    console.log("Executing schema SQL...");
    await pool.query(schemaSql);
    console.log("✅ Tables reset and created successfully.");

    // 2. Hash passwords
    console.log("Hashing passwords for users...");
    const hashedAdmin = await bcrypt.hash("admin", 10);
    const hashedHR = await bcrypt.hash("hr123", 10);
    const hashedManager = await bcrypt.hash("manager123", 10);
    const hashedEmp = await bcrypt.hash("employee123", 10);
    const hashedDefault = await bcrypt.hash("password123", 10);

    // 3. Seed Rich Users List
    console.log("Seeding rich users directory...");
    const usersResult = await pool.query(`
      INSERT INTO users (name, email, password, role, status) VALUES
      ('System Admin', 'admin@ems.com', $1, 'Admin', 'Active'),
      ('HR Specialist', 'hr@ems.com', $2, 'HR', 'Active'),
      ('Team Manager', 'manager@ems.com', $3, 'Manager', 'Active'),
      ('John Employee', 'employee@ems.com', $4, 'Employee', 'Active'),
      ('Alice Smith', 'alice@ems.com', $5, 'Employee', 'Active'),
      ('Bob Jones', 'bob@ems.com', $5, 'Employee', 'Active'),
      ('Charlie Brown', 'charlie@ems.com', $5, 'Employee', 'Active'),
      ('David Miller', 'david@ems.com', $5, 'Employee', 'Active'),
      ('Emma Wilson', 'emma@ems.com', $5, 'Employee', 'Active'),
      ('Frank Garcia', 'frank@ems.com', $5, 'Employee', 'Active')
      RETURNING id, name, role
    `, [hashedAdmin, hashedHR, hashedManager, hashedEmp, hashedDefault]);
    
    const usersMap = {};
    usersResult.rows.forEach(u => {
      usersMap[u.name] = u.id;
    });
    console.log("✅ 10 Users seeded.");

    // 4. Seed Departments
    console.log("Seeding departments...");
    const deptResult = await pool.query(`
      INSERT INTO departments (department_name, manager_id) VALUES
      ('Engineering', $1),
      ('Human Resources', $2),
      ('Sales', $3),
      ('Marketing', $4),
      ('Finance', $5)
      RETURNING id, department_name
    `, [
      usersMap['Team Manager'],
      usersMap['HR Specialist'],
      usersMap['Bob Jones'],
      usersMap['Emma Wilson'],
      usersMap['System Admin']
    ]);
    
    const deptMap = {};
    deptResult.rows.forEach(d => {
      deptMap[d.department_name] = d.id;
    });
    console.log("✅ 5 Departments seeded.");

    // 5. Seed Employee Profiles
    console.log("Seeding employee profiles...");
    const profileResult = await pool.query(`
      INSERT INTO employee_profiles (user_id, name, department_id, phone, address, designation, salary) VALUES
      ($1, 'System Admin', $11, '9999999991', '101 Admin Blvd', 'Head IT Administrator', 98000.00),
      ($2, 'HR Specialist', $12, '9999999992', '202 Recruiter Way', 'HR Manager', 78000.00),
      ($3, 'Team Manager', $13, '9999999993', '303 Lead Street', 'Engineering Lead', 92000.00),
      ($4, 'John Employee', $13, '9999999994', '404 Coder Lane', 'Frontend Engineer', 62000.00),
      ($5, 'Alice Smith', $13, '9999999995', '505 Design Court', 'UI/UX Designer', 65000.00),
      ($6, 'Bob Jones', $14, '9999999996', '606 Deal Drive', 'Sales Executive', 58000.00),
      ($7, 'Charlie Brown', $13, '9999999997', '707 Server Plaza', 'DevOps Engineer', 72000.00),
      ($8, 'David Miller', $14, '9999999998', '808 Pitch Road', 'Marketing Specialist', 55000.00),
      ($9, 'Emma Wilson', $15, '9999999999', '909 Campaign Ave', 'Marketing Lead', 74000.00),
      ($10, 'Frank Garcia', $13, '9999999910', '111 Database Rd', 'Backend Engineer', 68000.00)
      RETURNING id, name
    `, [
      usersMap['System Admin'],
      usersMap['HR Specialist'],
      usersMap['Team Manager'],
      usersMap['John Employee'],
      usersMap['Alice Smith'],
      usersMap['Bob Jones'],
      usersMap['Charlie Brown'],
      usersMap['David Miller'],
      usersMap['Emma Wilson'],
      usersMap['Frank Garcia'],
      deptMap['Finance'],
      deptMap['Human Resources'],
      deptMap['Engineering'],
      deptMap['Sales'],
      deptMap['Marketing']
    ]);
    
    const profileMap = {};
    profileResult.rows.forEach(p => {
      profileMap[p.name] = p.id;
    });
    console.log("✅ 10 Employee profiles seeded and linked.");

    // 6. Seed Skills
    console.log("Seeding skills...");
    const skillsResult = await pool.query(`
      INSERT INTO skills (skill_name) VALUES
      ('React'), ('Node.js'), ('PostgreSQL'), ('AWS Cloud'), 
      ('Figma Design'), ('Python Scripting'), ('CI/CD Pipelines'), 
      ('Enterprise Sales'), ('Product Marketing'), ('Corporate Finance')
      RETURNING id, skill_name
    `);
    
    const skillsMap = {};
    skillsResult.rows.forEach(s => {
      skillsMap[s.skill_name] = s.id;
    });
    console.log("✅ 10 Skills seeded.");

    // 7. Seed Employee Skills mapping
    console.log("Assigning skills to employees...");
    const empSkills = [
      { name: 'John Employee', skills: ['React', 'Figma Design'] },
      { name: 'Alice Smith', skills: ['Figma Design', 'React'] },
      { name: 'Team Manager', skills: ['Node.js', 'PostgreSQL', 'AWS Cloud'] },
      { name: 'Charlie Brown', skills: ['AWS Cloud', 'CI/CD Pipelines'] },
      { name: 'Frank Garcia', skills: ['Node.js', 'PostgreSQL', 'Python Scripting'] },
      { name: 'Bob Jones', skills: ['Enterprise Sales'] },
      { name: 'Emma Wilson', skills: ['Product Marketing'] }
    ];
    for (const item of empSkills) {
      const pId = profileMap[item.name];
      for (const skillName of item.skills) {
        const sId = skillsMap[skillName];
        await pool.query(`
          INSERT INTO employee_skills (employee_id, skill_id)
          VALUES ($1, $2)
        `, [pId, sId]);
      }
    }
    console.log("✅ Employee skills mapped.");

    // 8. Seed Leave Types
    console.log("Seeding leave types...");
    const leaveTypesResult = await pool.query(`
      INSERT INTO leave_types (leave_name, total_days) VALUES
      ('Sick Leave', 12),
      ('Casual Leave', 12),
      ('Annual Leave', 15),
      ('Maternity Leave', 90),
      ('Paternity Leave', 15),
      ('Unpaid Leave', 30)
      RETURNING id, leave_name, total_days
    `);
    const ltMap = {};
    leaveTypesResult.rows.forEach(l => {
      ltMap[l.leave_name] = l.id;
    });
    console.log("✅ 6 Leave types seeded.");

    // 9. Seed Leave Balances for all employee profiles & leave types
    console.log("Initializing leave balances...");
    for (const profile of profileResult.rows) {
      for (const lt of leaveTypesResult.rows) {
        await pool.query(`
          INSERT INTO leave_balance (employee_id, leave_type_id, remaining_days)
          VALUES ($1, $2, $3)
        `, [profile.id, lt.id, lt.total_days]);
      }
    }
    console.log("✅ Leave balances initialized for all users.");

    // 10. Seed Leave Applications (history and pending)
    console.log("Seeding leave applications and approval history...");
    const leaves = [
      {
        emp: 'John Employee',
        type: 'Sick Leave',
        from: '2026-05-10',
        to: '2026-05-12',
        days: 3,
        reason: 'Fever and cold',
        status: 'HR Approved',
        manager: 'Team Manager',
        hr: 'HR Specialist',
        history: [
          { actor: 'Team Manager', action: 'Manager Approved', remarks: 'Approved' },
          { actor: 'HR Specialist', action: 'HR Approved', remarks: 'HR Final Approval' }
        ]
      },
      {
        emp: 'John Employee',
        type: 'Casual Leave',
        from: '2026-06-15',
        to: '2026-06-17',
        days: 3,
        reason: 'Family gathering',
        status: 'Pending',
        manager: null,
        hr: null,
        history: []
      },
      {
        emp: 'Alice Smith',
        type: 'Sick Leave',
        from: '2026-06-02',
        to: '2026-06-03',
        days: 2,
        reason: 'Dental checkup',
        status: 'Rejected',
        manager: 'Team Manager',
        hr: null,
        history: [
          { actor: 'Team Manager', action: 'Rejected', remarks: 'Resource constraints this week' }
        ]
      },
      {
        emp: 'Charlie Brown',
        type: 'Annual Leave',
        from: '2026-07-01',
        to: '2026-07-10',
        days: 10,
        reason: 'Summer vacation trip',
        status: 'Manager Approved',
        manager: 'Team Manager',
        hr: null,
        history: [
          { actor: 'Team Manager', action: 'Manager Approved', remarks: 'Approved. Enjoy your vacation!' }
        ]
      },
      {
        emp: 'Bob Jones',
        type: 'Casual Leave',
        from: '2026-04-18',
        to: '2026-04-19',
        days: 2,
        reason: 'Personal errands',
        status: 'HR Approved',
        manager: 'Team Manager',
        hr: 'HR Specialist',
        history: [
          { actor: 'Team Manager', action: 'Manager Approved', remarks: 'Approved' },
          { actor: 'HR Specialist', action: 'HR Approved', remarks: 'Approved' }
        ]
      },
      {
        emp: 'David Miller',
        type: 'Sick Leave',
        from: '2026-06-12',
        to: '2026-06-14',
        days: 3,
        reason: 'Flu symptoms',
        status: 'Pending',
        manager: null,
        hr: null,
        history: []
      }
    ];

    for (const l of leaves) {
      const pId = profileMap[l.emp];
      const ltId = ltMap[l.type];
      const mId = l.manager ? usersMap[l.manager] : null;
      const hId = l.hr ? usersMap[l.hr] : null;
      
      const appResult = await pool.query(`
        INSERT INTO leave_applications (employee_id, leave_type_id, from_date, to_date, total_days, reason, status, manager_id, hr_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [pId, ltId, l.from, l.to, l.days, l.reason, l.status, mId, hId]);
      
      const appId = appResult.rows[0].id;
      
      for (const hist of l.history) {
        const actorId = usersMap[hist.actor];
        await pool.query(`
          INSERT INTO approval_history (leave_id, approved_by, action, remarks)
          VALUES ($1, $2, $3, $4)
        `, [appId, actorId, hist.action, hist.remarks]);
      }
      
      // If HR Approved, perform leave balance deduction
      if (l.status === 'HR Approved') {
        await pool.query(`
          UPDATE leave_balance
          SET remaining_days = remaining_days - $1
          WHERE employee_id = $2 AND leave_type_id = $3
        `, [l.days, pId, ltId]);
      }
    }
    console.log("✅ Leave applications and approval histories seeded.");

    // 11. Seed Attendance logs for last 3 days
    console.log("Seeding attendance clock-ins...");
    const dates = ['2026-06-10', '2026-06-11', '2026-06-12'];
    const empUserNames = ['John Employee', 'Alice Smith', 'Bob Jones', 'Charlie Brown', 'David Miller', 'Emma Wilson', 'Frank Garcia', 'Team Manager'];
    
    for (const date of dates) {
      for (const name of empUserNames) {
        const uId = usersMap[name];
        if (!uId) continue;
        
        // Randomize late clock-in
        const rand = Math.random();
        let clockInHour = 8;
        let clockInMin = Math.floor(Math.random() * 30) + 15; // 8:15 to 8:45
        let status = 'Present';
        
        if (rand > 0.8) {
          clockInHour = 9;
          clockInMin = Math.floor(Math.random() * 20) + 10; // 9:10 to 9:30 -> Late
          status = 'Late';
        } else if (rand > 0.95) {
          // Absent
          await pool.query(`
            INSERT INTO attendance (employee_id, date, status, total_hours)
            VALUES ($1, $2, 'Absent', 0.00)
            ON CONFLICT DO NOTHING
          `, [uId, date]);
          continue;
        }
        
        const clockInStr = `${date} ${String(clockInHour).padStart(2, '0')}:${String(clockInMin).padStart(2, '0')}:00`;
        const clockOutStr = `${date} 17:${String(Math.floor(Math.random() * 30) + 15).padStart(2, '0')}:00`; // 5:15 PM - 5:45 PM
        
        const inTime = new Date(clockInStr);
        const outTime = new Date(clockOutStr);
        const diffHours = (outTime - inTime) / (1000 * 60 * 60);
        
        await pool.query(`
          INSERT INTO attendance (employee_id, date, clock_in, clock_out, status, total_hours)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [uId, date, clockInStr, clockOutStr, status, Number(diffHours.toFixed(2))]);
      }
    }
    console.log("✅ Attendance database records initialized.");

    // 12. Seed Assets
    console.log("Seeding assets database...");
    const assetsData = [
      { code: 'LAP-001', name: 'MacBook Pro 16"', type: 'Hardware', date: '2026-01-10', cost: 2400.00, status: 'Allocated' },
      { code: 'LAP-002', name: 'MacBook Air 13"', type: 'Hardware', date: '2026-01-12', cost: 1200.00, status: 'Allocated' },
      { code: 'LAP-003', name: 'ThinkPad T14', type: 'Hardware', date: '2026-02-15', cost: 1400.00, status: 'Available' },
      { code: 'MON-001', name: 'Dell UltraSharp 27"', type: 'Hardware', date: '2026-03-01', cost: 450.00, status: 'Allocated' },
      { code: 'MON-002', name: 'LG 32" Monitor', type: 'Hardware', date: '2026-03-05', cost: 380.00, status: 'Available' },
      { code: 'KEY-001', name: 'Logitech MX Keys', type: 'Accessory', date: '2026-03-10', cost: 110.00, status: 'Allocated' },
      { code: 'MOU-001', name: 'Logitech MX Master 3', type: 'Accessory', date: '2026-03-10', cost: 99.00, status: 'Allocated' },
      { code: 'TAB-001', name: 'iPad Pro 11"', type: 'Hardware', date: '2026-04-20', cost: 900.00, status: 'Maintenance' },
      { code: 'CHR-001', name: 'Ergonomic Office Chair', type: 'Furniture', date: '2026-01-05', cost: 350.00, status: 'Allocated' }
    ];

    for (const a of assetsData) {
      await pool.query(`
        INSERT INTO assets (asset_code, asset_name, asset_type, purchase_date, purchase_cost, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [a.code, a.name, a.type, a.date, a.cost, a.status]);
    }
    console.log("✅ 9 Assets seeded.");

    // 13. Seed Asset Allocations and History
    console.log("Allocating assets to employees...");
    const assets = await pool.query("SELECT id, asset_code, asset_name FROM assets");
    const assetsMap = {};
    assets.rows.forEach(a => {
      assetsMap[a.asset_code] = a.id;
    });

    const allocations = [
      { code: 'LAP-001', emp: 'John Employee', by: 'System Admin' },
      { code: 'LAP-002', emp: 'Alice Smith', by: 'System Admin' },
      { code: 'MON-001', emp: 'John Employee', by: 'System Admin' },
      { code: 'KEY-001', emp: 'Charlie Brown', by: 'System Admin' },
      { code: 'MOU-001', emp: 'Charlie Brown', by: 'System Admin' },
      { code: 'CHR-001', emp: 'HR Specialist', by: 'System Admin' }
    ];

    for (const alloc of allocations) {
      const aId = assetsMap[alloc.code];
      const pId = profileMap[alloc.emp];
      const byId = usersMap[alloc.by];
      
      await pool.query(`
        INSERT INTO asset_allocations (asset_id, employee_id, allocated_by, status)
        VALUES ($1, $2, $3, 'Active')
      `, [aId, pId, byId]);
      
      await pool.query(`
        INSERT INTO asset_history (asset_id, action, remarks, created_by)
        VALUES ($1, 'Asset Allocated', $2, $3)
      `, [aId, `Assigned to ${alloc.emp}`, byId]);
    }
    console.log("✅ Asset allocations and histories mapped.");

    // 14. Seed Notifications
    console.log("Seeding system notification nodes...");
    const notificationsData = [
      { user: 'John Employee', title: 'Asset Assigned', message: 'MacBook Pro 16" (LAP-001) has been allocated to you.', read: false },
      { user: 'John Employee', title: 'Leave Update', message: 'Your Sick Leave application for May 10 was HR Approved.', read: true },
      { user: 'Alice Smith', title: 'Leave Rejected', message: 'Your leave application was rejected by Team Manager.', read: false },
      { user: 'HR Specialist', title: 'Leave Action Required', message: 'Charlie Brown has a Manager Approved leave request pending your final sign-off.', read: false },
      { user: null, title: 'System Notice', message: 'The database has been initialized with demo data.', read: false }
    ];

    for (const n of notificationsData) {
      const uId = n.user ? usersMap[n.user] : null;
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, is_read)
        VALUES ($1, $2, $3, $4)
      `, [uId, n.title, n.message, n.read]);
    }
    console.log("✅ Notifications seeded.");

    // 15. Audit Logs
    console.log("Seeding security audit trails...");
    const audits = [
      { user: 'System Admin', action: 'DB Seeding', details: 'Initial system demo database setup completed.' },
      { user: 'System Admin', action: 'Asset Registry Updated', details: 'Added 9 brand new company asset items.' },
      { user: 'Team Manager', action: 'Leave Approval', details: 'Approved leave request for John Employee.' },
      { user: 'HR Specialist', action: 'HR Final Approve', details: 'Finalized leave application and deducted days for John Employee.' }
    ];

    for (const a of audits) {
      const uId = usersMap[a.user];
      await pool.query(`
        INSERT INTO audit_logs (user_id, action, details)
        VALUES ($1, $2, $3)
      `, [uId, a.action, a.details]);
    }
    console.log("✅ Audit logs seeded.");

    console.log("\n🎉 RICH DEMO DATA SEEDED SUCCESSFULLY! ✅");
  } catch (error) {
    console.error("\n❌ Rich Seeding Error:", error);
  } finally {
    await pool.end();
  }
}

seed();
