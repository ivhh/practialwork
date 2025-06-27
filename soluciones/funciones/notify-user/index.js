// notify-user/index.js
// Cloud Function: notifyUser
// Simula el envío de una notificación y registra el evento en Cloud SQL

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'audit_notifs',
  password: process.env.DB_PASS,
  port: 5432,
});

/**
 * HTTP Cloud Function
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 */
exports.notifyUser = async (req, res) => {
  const { rut, mensaje } = req.body;
  if (!rut || !mensaje) return res.status(400).json({ error: 'Faltan datos' });

  try {
    // Simula envío de notificación (solo log)
    console.log(`Notificando a ${rut}: ${mensaje}`);
    // Registra en la base de datos
    await pool.query(
      'INSERT INTO notificaciones (rut, mensaje, fecha) VALUES ($1, $2, NOW())',
      [rut, mensaje]
    );
    res.json({ ok: true, rut, mensaje });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar notificación', details: err.message });
  }
};
