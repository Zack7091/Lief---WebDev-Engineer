# Lief Clock-In Application

A web and mobile-friendly application for healthcare organizations to manage and track staff shift timings.  
Built with **Next.js**, **GraphQL**, **Prisma**, and **Auth0**, this MVP allows managers to set geofenced clock-in perimeters and care workers to easily clock in and clock out of their shifts.

---

## 🚀 Features

### Care Worker
- **Clock In**
  - Only available within the location perimeter set by the manager.
  - Optional note on clock in.
  - Prevents clock in if outside the perimeter.
- **Clock Out**
  - Only available if already clocked in.
  - Optional note on clock out.
- **Authentication**
  - Register/login via **Auth0** (email & Google login supported).
  - View personal clock-in/out history.

### Manager
- Set **location perimeter** (e.g., 2 km radius).
- View table of currently clocked-in staff.
- For each staff:
  - See when and where they clocked in.
  - See when and where they clocked out.
- Dashboard analytics:
  - Average hours spent clocked in per day.
  - Number of people clocking in per day.
  - Total hours clocked in per staff in the past week.

---

## 📊 Dashboard & Analytics
- Implemented using **Chart.js** for visualizing:
  - Daily average hours.
  - Daily clock-in counts.
  - Weekly total hours per staff.

---

## 🛠 Tech Stack

**Frontend**
- Next.js
- React Context API (for state management)
- Grommet UI library (responsive & mobile-friendly)
- Chart.js (analytics)

**Backend**
- GraphQL API
- Prisma ORM
- PostgreSQL database

**Authentication**
- Auth0 (Google & Email login)

**Other**
- Geolocation API for perimeter checks
- Responsive design for desktop & mobile

---

## ⚡ Bonus Features Implemented
- **PWA Support**
  - Installable on devices.
  - Works offline (limited features).
- **Automatic Location Detection**
  - Notifies care workers when entering or leaving the perimeter.

---

---

## 📂 Project Structure
