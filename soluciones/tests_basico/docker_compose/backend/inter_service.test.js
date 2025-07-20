const request = require('supertest'); // Importar supertest como un objeto común
const API_URL = 'http://localhost:5000';

describe('Inter-Service Integration: Task Assignment', () => {
    let testProject, testTask;

    // Hook `beforeAll`: Se ejecuta una vez antes de todos los tests de este bloque.
    // Lo usamos para crear un proyecto y una tarea que serán compartidos entre los tests.
    // Esto evita repetir código de creación en cada `it`.
    beforeAll(async () => {
    const projectRes = await request(API_URL).put('/api/projects').send({ name: 'project_for_assignment' });
    testProject = projectRes.body;

    const taskRes = await request(API_URL).post(`/api/projects/${testProject.id}/tasks`).send({ title: 'task_to_be_assigned' });
    testTask = taskRes.body;
    });

    it('should successfully assign a task to an available user', async () => {
    // 1. Crear un usuario específico para este test con nombre único basado en timestamp.
    const uniqueUsername = `available_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const availableUserRes = await request(API_URL).put('/api/users').send({ username: uniqueUsername });
    const availableUser = availableUserRes.body;

    // 2. Intentar asignar la tarea a este usuario.
    const response = await request(API_URL)
        .patch(`/api/tasks/${testTask.id}/assign`)
        .send({ assigned_to: availableUser.id });

    // 3. Verificar que la operación fue exitosa.
    expect(response.statusCode).toBe(200);
    expect(response.body.assigned_to).toBe(availableUser.id);
    });

    it('should fail to assign a task to an unavailable user (ID 2)', async () => {
    // 1. Crear usuarios únicos para este test.
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    
    await request(API_URL).put('/api/users').send({ username: `user_1_${timestamp}_${randomStr}` });
    await request(API_URL).put('/api/users').send({ username: `user_2_${timestamp}_${randomStr}` });

    // 2. Intentar asignar la tarea al usuario con ID 2.
    const response = await request(API_URL)
        .patch(`/api/tasks/${testTask.id}/assign`)
        .send({ assigned_to: 2 }); // El validador rechazará al usuario con ID 2

    // 3. Verificar que la operación fue rechazada correctamente.
    expect(response.statusCode).toBe(409); // 409 Conflict
    expect(response.body.error).toBe('Usuario no disponible');
    });
});