// score-evaluator/index.js
// Cloud Function: scoreEvaluator
// Lee datos de un bucket y calcula el score crediticio de un usuario

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

/**
 * HTTP Cloud Function
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 */
exports.scoreEvaluator = async (req, res) => {
  const bucketName = process.env.BUCKET_NAME;
  const rut = req.body.rut || req.query.rut;
  if (!rut) return res.status(400).json({ error: 'Falta rut' });

  try {
    // Lee el archivo de scores
    const file = storage.bucket(bucketName).file('tabla_scores.json');
    const [contents] = await file.download();
    const tabla = JSON.parse(contents.toString());
    const score = tabla[rut] || null;
    if (score) {
      res.json({ rut, score });
    } else {
      res.status(404).json({ error: 'No se encontró score para el rut' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al calcular score', details: err.message });
  }
};
