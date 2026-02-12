const cron = require('node-cron');
const db = require('../config/db');
const { createNotification, sendReminder } = require('./notificationService');

/**
 * Cron Job: Send appointment reminders
 * Runs every day at 9:00 AM
 * Sends reminders for appointments scheduled for tomorrow
 */
cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily reminder cron job...');

    try {
        // Get tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Fetch tomorrow's confirmed/pending appointments
        const [appointments] = await db.execute(
            `SELECT 
                a.appointment_uid, a.appointment_date, a.time_slot,
                u.id AS patient_id, u.name AS patient_name, u.email AS patient_email,
                d.id AS doctor_id, d.name AS doctor_name, d.email AS doctor_email
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.appointment_date = ? AND a.status IN ('pending', 'confirmed')`,
            [tomorrowStr]
        );

        console.log(`📋 Found ${appointments.length} appointments for tomorrow (${tomorrowStr})`);

        for (const apt of appointments) {
            // In-app notification for patient
            await createNotification(
                apt.patient_id,
                'patient',
                'Appointment Reminder',
                `Your appointment with Dr. ${apt.doctor_name} is tomorrow at ${apt.time_slot}.`,
                'reminder'
            );

            // In-app notification for doctor
            await createNotification(
                apt.doctor_id,
                'doctor',
                'Appointment Reminder',
                `You have an appointment with ${apt.patient_name} tomorrow at ${apt.time_slot}.`,
                'reminder'
            );

            // Email reminder to patient
            await sendReminder(apt.patient_email, apt.patient_name, {
                appointment_uid: apt.appointment_uid,
                appointment_date: apt.appointment_date,
                time_slot: apt.time_slot,
                other_party: `Dr. ${apt.doctor_name}`
            }, 'patient');

            // Email reminder to doctor
            await sendReminder(apt.doctor_email, `Dr. ${apt.doctor_name}`, {
                appointment_uid: apt.appointment_uid,
                appointment_date: apt.appointment_date,
                time_slot: apt.time_slot,
                other_party: apt.patient_name
            }, 'doctor');
        }

        console.log('✅ Reminder cron job completed');
    } catch (error) {
        console.error('❌ Reminder cron job failed:', error.message);
    }
});

console.log('📅 Reminder cron job scheduled (daily at 9:00 AM)');
