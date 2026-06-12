# Enterprise Employee Management System (EMS) - Deployment Guide

This guide provides step-by-step instructions to deploy the full-stack EMS application on cloud hosting platforms.

---

## 1. Cloud PostgreSQL Database Setup

We recommend using **Neon** (neon.tech), **Supabase** (supabase.com), or **Render PostgreSQL** for a free hosted PostgreSQL database.

### Step 1: Create the Database Instance
1. Sign up on your chosen platform (e.g., [Neon](https://neon.tech)).
2. Create a new project and select **PostgreSQL** as the database type.
3. Choose the region closest to your users.
4. Retrieve your connection string. It will look like:
   `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`

### Step 2: Initialize the Database Schema
1. Connect to your database using a PostgreSQL GUI client (such as PGAdmin, DBeaver) or your cloud platform's built-in SQL Editor.
2. Open the file [schema.sql](file:///c:/Users/lenovo/Employee-Management-System/docs/schema.sql) in your text editor.
3. Copy the entire SQL queries and paste them into the SQL Editor.
4. Execute the script to create the 10 core tables.

---

## 2. Deploying Backend on Render

Render is ideal for hosting Node.js Express API servers.

### Step 1: Create a Render Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository containing the project.

### Step 2: Configure Service Settings
- **Name**: `employee-management-backend` (or similar)
- **Environment**: `Node`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Step 3: Configure Environment Variables
In the **Environment** tab on Render, add the following variables:
- `NODE_ENV` = `production`
- `PORT` = `10000` (Render binds this dynamically, but setting this provides a fallback)
- `DATABASE_URL` = `YOUR_CLOUD_POSTGRESQL_CONNECTION_STRING`
- `JWT_SECRET` = `YOUR_SECURE_RANDOM_SECRET_KEY`
- `EMAIL_USER` = `YOUR_GMAIL_ADDRESS` (for leave notifications)
- `EMAIL_PASS` = `YOUR_GMAIL_APP_PASSWORD`

### Step 4: Deploy and Health Check
1. Click **Deploy Web Service**.
2. Wait for the build logs to show `Server running on port 10000` and `PostgreSQL Connected`.
3. Check deployment status by calling the health endpoint: `https://[your-service-name].onrender.com/api/v1/health`
4. Copy your backend live URL.

---

## 3. Deploying Frontend on Vercel

Vercel is the optimal hosting platform for Vite-based React applications.

### Step 1: Add SPA Routing Configuration
To prevent 404 errors when reloading nested routes (like `/dashboard`) on Vite-based Single Page Applications, we use a `vercel.json` file in the frontend root. It is already prepared at the path: [vercel.json](file:///c:/Users/lenovo/Employee-Management-System/frontend/vercel.json).

### Step 2: Import Project on Vercel
1. Go to [Vercel](https://vercel.com) and log in.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.

### Step 3: Configure Build Options
- **Framework Preset**: `Vite` (automatically detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Add Environment Variables
Add the following key-value pair under the **Environment Variables** section:
- `VITE_API_URL` = `https://[your-backend-render-subdomain].onrender.com/api/v1`

### Step 5: Deploy
1. Click **Deploy**.
2. Once built, Vercel will provide your Live Frontend URL.
3. Access this URL, register a new user, and test the full application flow.
