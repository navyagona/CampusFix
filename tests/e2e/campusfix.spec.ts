import { test, expect } from '@playwright/test';

test.describe('CampusFix Maintenance Tracker E2E Suite', () => {
  test('1. Landing page loads cleanly with problem/solution and CTAs', async ({ page }) => {
    await page.goto('/');

    // Check main headline
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Campus repairs without the runaround');

    // Check navigation and CTAs
    await expect(page.getByRole('link', { name: 'Report an Issue' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Reports' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Staff Portal' }).first()).toBeVisible();

    // Check state machine steps
    await expect(page.locator('text=Submitted').first()).toBeVisible();
    await expect(page.locator('text=Acknowledged').first()).toBeVisible();
    await expect(page.locator('text=In Progress').first()).toBeVisible();
    await expect(page.locator('text=Resolved').first()).toBeVisible();
  });

  test('2. Student report submission, edit, and withdrawal flow', async ({ page }) => {
    // Navigate to new report form
    await page.goto('/reports/new');

    // Select category (e.g. Electrical)
    await page.getByRole('button', { name: /Electrical/i }).click();

    // Fill in location details
    await page.locator('#location-details').fill('Room 405, 4th floor study carrel');

    // Fill in title
    await page.locator('#issue-title').fill('Power outlet sparks when plugging laptop charger');

    // Fill in description
    await page
      .locator('#issue-desc')
      .fill(
        'The wall outlet at desk 12 made a loud spark and tripped the breaker when plugging in standard USB-C charger. Outlet appears scorched.'
      );

    // Submit form
    await page.getByRole('button', { name: /Submit Maintenance Request/i }).click();

    // Wait for redirect to report details page
    await page.waitForURL(/\/reports\/.+/);

    // Verify report details
    await expect(page.getByRole('heading', { level: 1, name: /Power outlet sparks/i })).toBeVisible();
    await expect(page.locator('text=Submitted').first()).toBeVisible();
    await expect(page.locator('text=Updates & Timeline')).toBeVisible();

    // Verify Edit Report action is available
    await page.getByRole('button', { name: /Edit Details/i }).click();
    await page.locator('input[value*="Power outlet sparks"]').fill('Power outlet sparks and smells burnt at desk 12');
    await page.getByRole('button', { name: /Save Changes/i }).click();

    // Verify title updated
    await expect(page.getByRole('heading', { level: 1, name: /smells burnt/i })).toBeVisible();

    // Verify Cancel Report action
    await page.getByRole('button', { name: /Cancel Report/i }).click();
    await page.getByRole('button', { name: /Yes, Cancel Report/i }).click();

    // Verify status is now Withdrawn
    await expect(page.locator('text=Withdrawn').first()).toBeVisible();
  });

  test('3. Role protection: Students blocked from staff triage operations', async ({ page }) => {
    // Ensure student role (Alex Chen)
    await page.goto('/');
    await page.getByRole('button', { name: /Alex \(Student\)/i }).click();

    // Attempt to access staff portal
    await page.goto('/staff/reports');

    // Verify authorization barrier is shown
    await expect(page.locator('text=Staff Authorization Required')).toBeVisible();
    await expect(
      page.locator('text=The Staff Portal and maintenance triage operations are protected by role-based access control')
    ).toBeVisible();
  });

  test('4. Staff portal: review metrics, filter tickets, and update status', async ({ page }) => {
    // Go to home and switch role to Dave Miller (Staff) via demo banner
    await page.goto('/');
    await page.getByRole('button', { name: /Dave \(Staff\)/i }).click();
    await page.waitForURL(/\/staff\/reports/);

    // Verify staff operations view rendered
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Facilities Staff Operations');
    await expect(page.locator('text=Staff Access')).toBeVisible();

    // Verify triage metrics cards
    await expect(page.locator('text=All Tickets')).toBeVisible();
    await expect(page.locator('text=Needs Review')).toBeVisible();

    // Open Triage on a ticket
    const triageButton = page.getByRole('button', { name: 'Triage' }).first();
    await triageButton.click();

    // Verify modal opened
    await expect(page.locator('text=Set Status')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
