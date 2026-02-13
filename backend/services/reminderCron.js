const cron = require('node-cron');
const db = require('../config/db');
const { sendReminder } = require('./notificationService');

const startReminderCron = () => {
    // Run every day at 8:00 AM — send reminders for tomorrow's appointments
    cron.schedule('0 8 * * *', async () => {
        console.log('🔔 Running appointment reminder cron job...');

        try {
            // Get tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            // Find all confirmed/pending appointments for tomorrow
            const [appointments] = await db.query(`
        SELECT 
          a.*,
          u.name AS patient_name, u.email AS patient_email,
          d.name AS doctor_name, d.email AS doctor_email
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.appointment_date = ?
        AND a.status IN ('pending', 'confirmed')
      `, [tomorrowStr]);

            console.log(`📋 Found ${appointments.length} appointments for tomorrow (${tomorrowStr})`);

            for (const appt of appointments) {
                await sendReminder(
                    appt,
                    appt.patient_email,
                    appt.doctor_email,
                    appt.patient_name,
                    appt.doctor_name
                );
            }

            console.log('✅ Reminder notifications sent successfully');
        } catch (error) {
            console.error('❌ Reminder cron error:', error.message);
        }
    });

    console.log('⏰ Appointment reminder cron job scheduled (daily at 8:00 AM)');
};

module.exports = { startReminderCron };
