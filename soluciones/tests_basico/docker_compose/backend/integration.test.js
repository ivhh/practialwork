const request = require('supertest');

// La URL del backend dentro de la red de Docker
const API_URL = 'http://localhost:5000';

describe('Integration Tests: Users and Projects', () => {
    it('should create a new user via PUT /api/users', async () => {
    const newUsername = `user_${Date.now()}`;
    
    const response = await request(API_URL)
        .put('/api/users')
        .send({ username: newUsername });

    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe(newUsername);
    });

    it('should create a new project via PUT /api/projects', async () => {
    const newProjectName = `project_${Date.now()}`;

    const response = await request(API_URL)
        .put('/api/projects')
        .send({ name: newProjectName });

    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe(newProjectName);
    });
});