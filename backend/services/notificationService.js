const nodemailer = require('nodemailer');
const db = require('../config/db');
require('dotenv').config();

// Email transporter
let transporter;
try {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} catch (error) {
    console.warn('⚠️  Email service not configured. Notifications will be in-app only.');
}

// Create in-app notification
const createNotification = async (userId, userType, title, message, type = 'system') => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, user_type, title, message, type) VALUES (?, ?, ?, ?, ?)',
            [userId, userType, title, message, type]
        );
        return true;
    } catch (error) {
        console.error('Notification creation error:', error.message);
        return false;
    }
};

// Send email notification
const sendEmail = async (to, subject, html) => {
    if (!transporter || !process.env.EMAIL_USER) {
        console.log(`📧 Email notification (not sent - no config): To: ${to}, Subject: ${subject}`);
        return false;
    }

    try {
        await transporter.sendMail({
            from: `"Doctor Appointment System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`📧 Email sent to ${to}: ${subject}`);
        return true;
    } catch (error) {
        console.error('Email sending error:', error.message);
        return false;
    }
};

// Booking confirmation notification
const notifyBookingConfirmation = async (appointment, patientEmail, doctorEmail, patientName, doctorName) => {
    // In-app notification to patient
    await createNotification(
        appointment.patient_id,
        'patient',
        'Appointment Booked',
        `Your appointment with Dr. ${doctorName} on ${appointment.appointment_date} at ${appointment.time_slot} has been booked. Appointment ID: ${appointment.appointment_uid}`,
        'booking'
    );

    // In-app notification to doctor
    await createNotification(
        appointment.doctor_id,
        'doctor',
        'New Appointment',
        `New appointment from ${patientName} on ${appointment.appointment_date} at ${appointment.time_slot}. Appointment ID: ${appointment.appointment_uid}`,
        'booking'
    );

    // Email to patient
    await sendEmail(patientEmail, 'Appointment Booking Confirmation', `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Confirmed ✅</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment has been successfully booked:</p>
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Appointment ID:</strong> ${appointment.appointment_uid}</p>
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Date:</strong> ${appointment.appointment_date}</p>
        <p><strong>Time:</strong> ${appointment.time_slot}</p>
      </div>
      <p>Thank you for using our service!</p>
    </div>
  `);
};

// Cancellation notification
const notifyCancellation = async (appointment, cancelledBy, patientEmail, doctorEmail, patientName, doctorName) => {
    const cancellerText = cancelledBy === 'patient' ? patientName : `Dr. ${doctorName}`;

    await createNotification(
        appointment.patient_id,
        'patient',
        'Appointment Cancelled',
        `Your appointment (${appointment.appointment_uid}) on ${appointment.appointment_date} at ${appointment.time_slot} has been cancelled by ${cancellerText}.`,
        'cancellation'
    );

    await createNotification(
        appointment.doctor_id,
        'doctor',
        'Appointment Cancelled',
        `Appointment (${appointment.appointment_uid}) with ${patientName} on ${appointment.appointment_date} at ${appointment.time_slot} has been cancelled by ${cancellerText}.`,
        'cancellation'
    );

    await sendEmail(patientEmail, 'Appointment Cancelled', `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Appointment Cancelled ❌</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment (${appointment.appointment_uid}) has been cancelled.</p>
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Date:</strong> ${appointment.appointment_date}</p>
        <p><strong>Time:</strong> ${appointment.time_slot}</p>
        <p><strong>Cancelled By:</strong> ${cancellerText}</p>
      </div>
    </div>
  `);
};

// Reminder notification
const sendReminder = async (appointment, patientEmail, doctorEmail, patientName, doctorName) => {
    await createNotification(
        appointment.patient_id,
        'patient',
        'Appointment Reminder',
        `Reminder: You have an appointment with Dr. ${doctorName} tomorrow at ${appointment.time_slot}.`,
        'reminder'
    );

    await createNotification(
        appointment.doctor_id,
        'doctor',
        'Appointment Reminder',
        `Reminder: You have an appointment with ${patientName} tomorrow at ${appointment.time_slot}.`,
        'reminder'
    );

    await sendEmail(patientEmail, 'Appointment Reminder - Tomorrow', `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Appointment Reminder 🔔</h2>
      <p>Dear ${patientName},</p>
      <p>This is a reminder that you have an appointment <strong>tomorrow</strong>:</p>
      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Date:</strong> ${appointment.appointment_date}</p>
        <p><strong>Time:</strong> ${appointment.time_slot}</p>
      </div>
      <p>Please arrive 10 minutes early. Thank you!</p>
    </div>
  `);

    await sendEmail(doctorEmail, 'Appointment Reminder - Tomorrow', `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Appointment Reminder 🔔</h2>
      <p>Dear Dr. ${doctorName},</p>
      <p>You have an appointment tomorrow:</p>
      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date:</strong> ${appointment.appointment_date}</p>
        <p><strong>Time:</strong> ${appointment.time_slot}</p>
      </div>
    </div>
  `);
};

module.exports = {
    createNotification,
    sendEmail,
    notifyBookingConfirmation,
    notifyCancellation,
    sendReminder
};
