const express = require('express');
const request = require('supertest');

// Creamos una app de Express falsa para el test
const app = express();
app.use(express.json());

// Simulamos (mock) un endpoint
app.get('/api/users', (req, res) => {
    res.json([{ id: 1, username: 'testuser' }]);
});

// Describimos el conjunto de tests
describe('GET /api/users', () => {
    it('should return a list of users', async () => {
    const response = await request(app).get('/api/users');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([{ id: 1, username: 'testuser' }]);
    });
});