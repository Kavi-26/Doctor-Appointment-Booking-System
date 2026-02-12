const db = require('../config/db');

exports.bookAppointment = async (req, res) => {
    try {
        const { doctor_id, appointment_date, appointment_time, reason } = req.body;
        const patient_id = req.user.id;

        // Check availability (Basic check: is slot already taken?)
        const [existing] = await db.execute(
            'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "cancelled"',
            [doctor_id, appointment_date, appointment_time]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Slot already booked' });
        }

        await db.execute(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, reason]
        );

        res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        let query = '';

        if (req.user.role === 'doctor') {
            // For doctors: get appointments where they are the doctor
            // First get doctor id
            const [doctorRows] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
            if (doctorRows.length === 0) return res.json([]);
            const doctorId = doctorRows[0].id;

            query = `
                SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
                       u.name as patient_name, u.email as patient_email, u.phone as patient_phone
                FROM appointments a
                JOIN users u ON a.patient_id = u.id
                WHERE a.doctor_id = ?
                ORDER BY a.appointment_date, a.appointment_time
             `;
            const [appointments] = await db.execute(query, [doctorId]);
            return res.json(appointments);

        } else {
            // For patients
            query = `
                SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
                       u.name as doctor_name, d.specialization
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                JOIN users u ON d.user_id = u.id
                WHERE a.patient_id = ?
                ORDER BY a.appointment_date, a.appointment_time
            `;
            const [appointments] = await db.execute(query, [userId]);
            return res.json(appointments);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;

        // TODO: Validate that the user owns this appointment or is a doctor for it
        // For now, assume protected route handles authentication

        await db.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
