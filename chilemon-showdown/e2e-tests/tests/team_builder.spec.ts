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
    test("Create a new team successfully", async ({page}) => {
        // Dismiss any alerts automatically
        page.on('dialog', async dialog => dialog.accept());

        // Select first 6 available Chilemon
        for (let i = 0; i < 6; i++) {
            await page.locator('.available-card').nth(i).click();
        }

        // Set team name and save
        const teamName = 'Equipo Playwright';
        await page.fill('.team-name-input', teamName);
        await page.click('.save-button');

        // Wait for the team to appear in the sidebar
        await expect(page.locator('.team-sidebar-item', { hasText: teamName })).toBeVisible();
    });

    test('Access team content to read members', async ({page}) => {
        page.on('dialog', async dialog => dialog.accept());

        const teamName = 'Equipo Playwright';

        // Create team first (ensure it exists)
        for (let i = 0; i < 6; i++) {
            await page.locator('.available-card').nth(i).click();
        }
        await page.fill('.team-name-input', teamName);
        await page.click('.save-button');
        await expect(page.locator('.team-sidebar-item', { hasText: teamName })).toBeVisible();

        // Open the created team
        await page.locator('.team-sidebar-item', { hasText: teamName }).click();

        // Ensure 6 filled slots (images) are visible
        await expect(page.locator('.team-slot img.slot-avatar')).toHaveCount(6);
    });

    test('Edit existing team replacing one Chilemon', async ({page}) => {
        page.on('dialog', async dialog => dialog.accept());

        const teamName = 'Equipo Playwright';

        // Create team first
        for (let i = 0; i < 6; i++) {
            await page.locator('.available-card').nth(i).click();
        }
        await page.fill('.team-name-input', teamName);
        await page.click('.save-button');
        await expect(page.locator('.team-sidebar-item', { hasText: teamName })).toBeVisible();

        // Open and capture current members
        await page.locator('.team-sidebar-item', { hasText: teamName }).click();
        const beforeNames = await page.locator('.team-slot .slot-name').allTextContents();
        expect(beforeNames.length).toBeGreaterThanOrEqual(1);

        // Remove the first member
        await page.locator('.team-slot .slot-remove').first().click();

        // Pick an available card that is not selected
        const availableNotSelected = page.locator('.available-card:not(.selected)');
        await availableNotSelected.first().click();

        // Save changes
        await page.click('.save-button');

        // Re-open team and get names
        await page.locator('.team-sidebar-item', { hasText: teamName }).click();
        const afterNames = await page.locator('.team-slot .slot-name').allTextContents();

        // The names array should still have 6 entries after edit
        expect(afterNames.length).toBe(6);
        // And the set of names should differ from before (at least one replacement)
        const same = beforeNames.every(n => afterNames.includes(n));
        expect(same).toBeFalsy();
    });

    test('Delete an existing team', async ({page}) => {
        // Handle confirm dialog by accepting it
        page.on('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });

        const teamName = 'Equipo Playwright';

        // Create team first
        page.on('dialog', async dialog => dialog.accept());
        for (let i = 0; i < 6; i++) {
            await page.locator('.available-card').nth(i).click();
        }
        await page.fill('.team-name-input', teamName);
        await page.click('.save-button');
        await expect(page.locator('.team-sidebar-item', { hasText: teamName })).toBeVisible();

        // Click delete button on the team sidebar item
        const teamItem = page.locator('.team-sidebar-item', { hasText: teamName });
        await teamItem.locator('.delete-sidebar-button').click();

        // Verify the team is not visible anymore
        await expect(page.locator('.team-sidebar-item', { hasText: teamName })).toHaveCount(0);
    });


});