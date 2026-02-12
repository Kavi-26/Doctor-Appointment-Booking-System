# Doctor Appointment Booking System

A comprehensive web application for booking doctor appointments, featuring distinct portals for Patients, Doctors, and Administrators.

## Tech Stack
- **Frontend**: Vanilla JavaScript, Vite, CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Features
- **Patients**: Register, Login, Search Doctors, Book Appointments, View History.
- **Doctors**: Manage Availability, View Appointments, Approve/Reject Requests.
- **Admins**: Manage Users & Doctors, View System Stats.

## Setup

### Prerequisites
- Node.js installed
- MySQL installed and running
- Create a database named `doctor_appointment_system` (or update `.env`)

### Backend
1. Navigate to `server/`
2. Run `npm install`
3. Configure `.env` with your DB credentials.
4. Run `npm run init-db` (to create tables - coming soon)
5. Run `npm run dev`

### Frontend
1. Navigate to `client/`
2. Run `npm install`
3. Run `npm run dev`
