describe('(authd)/index', () => {
    beforeEach(async () => {
        await require('./__helpers__/launch-app-defaults').launchAppWithDefaults();
    });

    it('should display Menu, Map, and Teams tabs.', async () => {
        await require('./__helpers__/auth-flow').signOn();
        await expect(element(by.text('Menu'))).toBeVisible();
        await expect(element(by.text('Map'))).toBeVisible();
        await expect(element(by.text('Teams'))).toBeVisible();
    });
});
