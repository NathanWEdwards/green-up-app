import { launchAppWithDefaults } from '@/e2e/__helpers__/launch-app-defaults.js';
import { signOn } from '@/e2e/__helpers__/auth-flow.js';

describe('Authentication Flow', () => {
    beforeAll(async () => {
        await launchAppWithDefaults();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should show validation error on empty login', async () => {
        await element(by.id('login-button')).tap();
        await expect(
            element(by.text('Please enter email and password'))
        ).toBeVisible();
        await element(by.text('OK')).tap();
    });

    it('should navigate to create account and successfully create user, navigating to dashboard', async () => {
        await element(by.id('create-account-link')).tap();

        // Ensure create account modal is open
        await expect(element(by.id('create-displayName-input'))).toBeVisible();

        // Fill out standard details
        await element(by.id('create-displayName-input')).typeText('Test User');
        await element(by.id('create-email-input')).typeText(
            'testuser@example.com'
        );

        // On iOS sometimes tapping return key is easier, on android hiding keyboard happens via tap
        await element(by.id('create-password-input')).typeText('password123\n');

        // Tap submit (might need to close keyboard safely first if the element is hidden)
        try {
            await element(by.id('create-submit-button')).tap();
        } catch {
            await device.pressBack(); // close keyboard if obstructing
            await element(by.id('create-submit-button')).tap();
        }

        // Dashboard is accessible
        await expect(element(by.text('FIND A TEAM')).atIndex(0)).toExist();
    });

    it('should login an existing mock user correctly to dashboard', async () => {
        await signOn();

        await waitFor(element(by.text('FIND A TEAM')).atIndex(0))
            .toBeVisible()
            .withTimeout(10000);
    });
});
