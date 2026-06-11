# Enterprise Employee Management System (EMS) - API Documentation

This document describes the API endpoints for the EMS application, categorized by module. All requests default to the prefix `/api/v1`.

---

## 🔒 Authentication & Users Module
**Prefix**: `/api/v1/auth`

### 1. User Register / Signup
- **Method**: `POST`
- **Path**: `/signup`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Response**: `201 Created`

### 2. User Login
- **Method**: `POST`
- **Path**: `/login`
- **Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` (returns JWT Token and user profile details)

### 3. Create User (Admin Only)
- **Method**: `POST`
- **Path**: `/create-user`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "role": "Manager",
    "status": "Active"
  }
  ```

### 4. Fetch All Users (Admin Only)
- **Method**: `GET`
- **Path**: `/users`
- **Headers**: `Authorization: Bearer <token>`

### 5. Update User Role (Admin Only)
- **Method**: `PUT`
- **Path**: `/users/:id/role`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "role": "HR"
  }
  ```

---

## 👥 Employee Profiles Module
**Prefix**: `/api/v1/employees`

### 1. Fetch Employees (With Pagination & Search)
- **Method**: `GET`
- **Path**: `/`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `page=1`, `limit=100`, `search=John`

### 2. Get Employee Details
- **Method**: `GET`
- **Path**: `/:id`

### 3. Create Employee Profile
- **Method**: `POST`
- **Path**: `/`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "department_id": 1,
    "phone": "9876543210",
    "address": "123 Main St",
    "designation": "Software Developer",
    "salary": 65000
  }
  ```

---

## 📅 Attendance Management Module
**Prefix**: `/api/v1/attendance`

### 1. Clock In (Daily Entry Punch)
- **Method**: `POST`
- **Path**: `/clock-in`
- **Headers**: `Authorization: Bearer <token>`
- **Behavior**: Checks if clocked in. Marks status as `'Present'` (<= 09:00 AM) or `'Late'` (> 09:00 AM).

### 2. Clock Out
- **Method**: `POST`
- **Path**: `/clock-out`
- **Headers**: `Authorization: Bearer <token>`
- **Behavior**: Registers clock-out and updates total shift duration.

### 3. Fetch Today's Punch State
- **Method**: `GET`
- **Path**: `/today`
- **Headers**: `Authorization: Bearer <token>`

### 4. Fetch Attendance Logs (Securely Sandboxed)
- **Method**: `GET`
- **Path**: `/history`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params (Admins/HR/Managers)**: `employee_id=1`, `status=Present`, `date=2026-06-12`

---

## 📋 Leave Workflow Management Module
**Prefix**: `/api/v1/leaves`

### 1. Apply Leave
- **Method**: `POST`
- **Path**: `/`
- **Body**:
  ```json
  {
    "employee_id": 1,
    "leave_type_id": 1,
    "from_date": "2026-06-15",
    "to_date": "2026-06-18",
    "total_days": 3,
    "reason": "Family function"
  }
  ```

### 2. Approve Leave (Manager Level)
- **Method**: `PUT`
- **Path**: `/approve/:id`

### 3. Finalize Leave (HR Level)
- **Method**: `PUT`
- **Path**: `/hr-approve/:id`
- **Behavior**: Automatically deducts days from the employee's remaining leave balance.

---

## 💻 Asset Management Module
**Prefix**: `/api/v1/assets`

### 1. Allocate Asset
- **Method**: `POST`
- **Path**: `/allocate`
- **Body**:
  ```json
  {
    "asset_id": 2,
    "employee_id": 3,
    "allocated_by": 1
  }
  ```

---

## 📢 Notification Engine
**Prefix**: `/api/v1/notifications`

### 1. Get Logged-In User Notifications
- **Method**: `GET`
- **Path**: `/`
- **Headers**: `Authorization: Bearer <token>`

---

## 📊 Compliance Audit logs
**Prefix**: `/api/v1/audit-logs`

### 1. Get Security logs (Admin Only)
- **Method**: `GET`
- **Path**: `/`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `search=Jane`, `actionType=Role Updated`, `startDate=2026-06-01`
