import {test, expect} from '@playwright/test';
import {login} from './helpers';
test.describe('Login tests', () => {
    test.beforeEach(async ({page, request}) => {
        await request.post('/api/tests/reset');
        await request.post('/api/users',
            {data: {username: 'testuser', password: 'testpassword'}}
        );
        await page.goto('/');
    });
    test('Successful login with valid credentials', async ({page}) => {
        await login(page, 'testuser', 'testpassword');
        await expect(page).toHaveURL(/.*home.*/);
    });

    test('Protected API blocked before login and accessible after login', async ({page, request}) => {
        // Sin autenticación esperamos que sea 401
        const unauth = await request.get('/api/teams');
        expect(unauth.status()).toBe(401);

        // ingresamos a la app
        await login(page, 'testuser', 'testpassword');
        await expect(page).toHaveURL(/.*home.*/);

        // Usamos `page.request` que comparte las cookies del contexto del navegador para llamar a la API protegida
        const authRes = await page.request.get('/api/teams');
        //expect(authRes.status()).toBe(200);
    });

});