import {test, expect} from '@playwright/test';
import {login} from './helpers';

test.describe('Create Chilemon Team', () => {
    test.beforeEach(async ({page, request}) => {
        await request.post('http://localhost:3001/api/tests/reset');
        await request.post('http://localhost:3001/api/users',
            {data: {username: 'user', password: 'password'}}
        );
        await page.goto('/');
        await login(page, 'user', 'password');
        await page.goto('/team-builder');
    });



});