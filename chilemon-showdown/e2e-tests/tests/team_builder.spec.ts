import {test, expect} from '@playwright/test';
import {login} from './helpers';

test.describe('Create Chilemon Team', () => {
    test.beforeEach(async ({page, request}) => {
        await request.post('/api/tests/reset');
        await request.post('/api/users',
            {data: {username: 'user', password: 'password'}}
        );
        await page.goto('/');
        await login(page, 'user', 'password');
        await page.goto('/team-builder');
    });
    test("Create a new team successfully", async ({page}) => {
        for (let i = 0; i < 6; i++) {
            await page.locator('.available-card').nth(i).click();
        }

        const teamName = 'Equipo Playwright';
        await page.fill('input[name="team-name-input"]', teamName);
        await page.click('.save-button');

        await expect(page.locator('.team-sidebar-item', { hasText: teamName })).toBeVisible();
    });

    test('Access team content to read members', async ({page}) => {
        page.on('dialog', async dialog => dialog.accept());

        const teamName = 'Equipo Playwright';

        for (let i = 0; i < 6; i++) {
            await page.locator('.available-card').nth(i).click();
        }
        await page.fill('input[name="team-name-input"]', teamName);
        await page.click('.save-button');
        await expect(page.locator(`.team-sidebar-item[data-team-name="${teamName}"]`)).toBeVisible();

        await page.locator('.team-sidebar-item', { hasText: teamName }).click();

        await expect(page.locator('.team-slot img.slot-avatar')).toHaveCount(6);
    });

    test('Edit existing team replacing one Chilemon', async ({page}) => {
        page.on('dialog', async dialog => dialog.accept());

        const teamName = 'Equipo Playwright';

        for (let i = 0; i < 6; i++) {
            await page.locator('.available-card').nth(i).click();
        }
        await page.fill('input[name="team-name-input"]', teamName);
        await page.click('.save-button');
        await expect(page.locator(`.team-sidebar-item[data-team-name="${teamName}"]`)).toBeVisible();

        await page.locator('.team-sidebar-item', { hasText: teamName }).click();
        const beforeNames = await page.locator('.team-slot .slot-name').allTextContents();
        expect(beforeNames.length).toBeGreaterThanOrEqual(1);

        await page.locator('.team-slot .slot-remove').first().click();

        const availableNotSelected = page.locator('.available-card:not(.selected)');
        await availableNotSelected.first().click();

        await page.click('.save-button');

        await page.locator('.team-sidebar-item', { hasText: teamName }).click();
        const afterNames = await page.locator('.team-slot .slot-name').allTextContents();

        expect(afterNames.length).toBe(6);
        const same = beforeNames.every(n => afterNames.includes(n));
        expect(same).toBeFalsy();
    });

    test('Delete an existing team', async ({page}) => {
        page.on('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });

        const teamName = 'Equipo Playwright';

        page.on('dialog', async dialog => dialog.accept());
        for (let i = 0; i < 6; i++) {
            await page.locator('.available-card').nth(i).click();
        }
        await page.fill('input[name="team-name-input"]', teamName);
        await page.click('.save-button');
        await expect(page.locator(`.team-sidebar-item[data-team-name="${teamName}"]`)).toBeVisible();

        const teamItem = page.locator('.team-sidebar-item', { hasText: teamName });
        await teamItem.locator('.delete-sidebar-button').click();

        await expect(page.locator('.team-sidebar-item', { hasText: teamName })).toHaveCount(0);
    });


});