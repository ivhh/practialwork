import express from 'express';
const app = express();
app.use(express.json());
const PORT = 5001;

app.post('/validate', (req, res) => {
    const { userId } = req.body;
    console.log(`Validando disponibilidad para el usuario: ${userId}`);

    // Lógica de simulación: el usuario con ID 2 siempre está ocupado.
    if (parseInt(userId, 10) === 2) {
        return res.json({ userId, available: false, reason: "User is on vacation" });
    }
    
    res.json({ userId, available: true });
});

app.listen(PORT, () => {
    console.log(`Availability Validator corriendo en el puerto ${PORT}`);
});