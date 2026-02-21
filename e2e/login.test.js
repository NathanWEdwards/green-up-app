describe('sign-in', () => {
    beforeEach(async () => {
        await require('./__helpers__/launch-app-defaults').launchAppWithDefaults();
    });
    it('should display the sign-in screen with input fields.', async () => {
        // Adjust test case to factor sticky Firbase authentication state
        // persisting across tests.
        try {
            await element(by.id('sign-out')).tap();
        } catch (error) {}
        await expect(element(by.id('email-input'))).toBeVisible();
        await expect(element(by.id('password-input'))).toBeVisible();
        await expect(element(by.id('submit-button'))).toBeVisible();
    });
    it('should sign in successfully with valid credentials.', async () => {
        await require('./__helpers__/auth-flow').signOn();
        await expect(element(by.text('Menu'))).toBeVisible();});
});  