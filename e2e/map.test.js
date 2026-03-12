describe('(authd)/map/index', () => {
    beforeEach(async () => {
        await require('./__helpers__/launch-app-defaults').launchAppWithDefaults();
    });

    it('should display activity/window text', async () => {
        await require('./__helpers__/auth-flow').signOn();
        await waitFor(element(by.text('Map')))
            .toBeVisible()
            .withTimeout(10000);
        await element(by.label('Open map')).tap();
        await waitFor(element(by.id('map-view-text')))
            .toBeVisible()
            .withTimeout(10000);
    });
});
