const nodemailer = require('nodemailer');
const db = require('../config/db');
require('dotenv').config();

// ─── Email Transporter ────────────────────────────────
let transporter;
try {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
} catch (error) {
    console.log('⚠️  Email service not configured:', error.message);
}

/**
 * Create in-app notification
 */
const createNotification = async (userId, userType, title, message, type = 'general') => {
    try {
        await db.execute(
            'INSERT INTO notifications (user_id, user_type, title, message, type) VALUES (?, ?, ?, ?, ?)',
            [userId, userType, title, message, type]
        );
        return true;
    } catch (error) {
        console.error('Notification Error:', error.message);
        return false;
    }
};

/**
 * Send email notification
 */
const sendEmail = async (to, subject, html) => {
    if (!transporter || !process.env.EMAIL_USER) {
        console.log('📧 Email skipped (not configured):', subject);
        return false;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'Doctor Appointment System <noreply@docbook.com>',
            to,
            subject,
            html
        });
        console.log('📧 Email sent to:', to);
        return true;
    } catch (error) {
        console.error('Email Error:', error.message);
        return false;
    }
};

/**
 * Send booking confirmation
 */
const sendBookingConfirmation = async (patientEmail, doctorEmail, appointmentDetails) => {
    const { appointment_uid, doctor_name, patient_name, appointment_date, time_slot } = appointmentDetails;

    // Notify patient
    const patientHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px; border-radius: 16px;">
            <div style="background: #ffffff; border-radius: 14px; padding: 40px;">
                <h2 style="color: #667eea; margin-bottom: 20px;">✅ Appointment Confirmed</h2>
                <p>Dear <strong>${patient_name}</strong>,</p>
                <p>Your appointment has been booked successfully!</p>
                <div style="background: #f8f9ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p><strong>Appointment ID:</strong> ${appointment_uid}</p>
                    <p><strong>Doctor:</strong> Dr. ${doctor_name}</p>
                    <p><strong>Date:</strong> ${appointment_date}</p>
                    <p><strong>Time:</strong> ${time_slot}</p>
                </div>
                <p style="color: #666;">You will receive a reminder 24 hours before your appointment.</p>
            </div>
        </div>
    `;
    await sendEmail(patientEmail, `Appointment Confirmed - ${appointment_uid}`, patientHtml);

    // Notify doctor
    const doctorHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 2px; border-radius: 16px;">
            <div style="background: #ffffff; border-radius: 14px; padding: 40px;">
                <h2 style="color: #11998e; margin-bottom: 20px;">📋 New Appointment</h2>
                <p>Dear Dr. <strong>${doctor_name}</strong>,</p>
                <p>You have a new appointment request!</p>
                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p><strong>Appointment ID:</strong> ${appointment_uid}</p>
                    <p><strong>Patient:</strong> ${patient_name}</p>
                    <p><strong>Date:</strong> ${appointment_date}</p>
                    <p><strong>Time:</strong> ${time_slot}</p>
                </div>
            </div>
        </div>
    `;
    await sendEmail(doctorEmail, `New Appointment - ${appointment_uid}`, doctorHtml);
};

/**
 * Send cancellation alert
 */
const sendCancellationAlert = async (email, name, appointmentDetails, userType) => {
    const { appointment_uid, appointment_date, time_slot } = appointmentDetails;
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); padding: 2px; border-radius: 16px;">
            <div style="background: #ffffff; border-radius: 14px; padding: 40px;">
                <h2 style="color: #eb3349; margin-bottom: 20px;">❌ Appointment Cancelled</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>The following appointment has been cancelled:</p>
                <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p><strong>Appointment ID:</strong> ${appointment_uid}</p>
                    <p><strong>Date:</strong> ${appointment_date}</p>
                    <p><strong>Time:</strong> ${time_slot}</p>
                </div>
            </div>
        </div>
    `;
    await sendEmail(email, `Appointment Cancelled - ${appointment_uid}`, html);
};

/**
 * Send appointment reminder
 */
const sendReminder = async (email, name, appointmentDetails, userType) => {
    const { appointment_uid, appointment_date, time_slot, other_party } = appointmentDetails;
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2px; border-radius: 16px;">
            <div style="background: #ffffff; border-radius: 14px; padding: 40px;">
                <h2 style="color: #f5576c; margin-bottom: 20px;">⏰ Appointment Reminder</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>This is a reminder for your upcoming appointment <strong>tomorrow</strong>.</p>
                <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p><strong>Appointment ID:</strong> ${appointment_uid}</p>
                    <p><strong>${userType === 'patient' ? 'Doctor' : 'Patient'}:</strong> ${other_party}</p>
                    <p><strong>Date:</strong> ${appointment_date}</p>
                    <p><strong>Time:</strong> ${time_slot}</p>
                </div>
                <p style="color: #666;">Please be on time. Thank you!</p>
            </div>
        </div>
    `;
    await sendEmail(email, `Appointment Tomorrow - ${appointment_uid}`, html);
};

module.exports = {
    createNotification,
    sendEmail,
    sendBookingConfirmation,
    sendCancellationAlert,
    sendReminder
};
