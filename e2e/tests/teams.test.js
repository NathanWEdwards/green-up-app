import { launchAppWithDefaults } from '@/e2e/__helpers__/launch-app-defaults.js';
import { signOn } from '@/e2e/__helpers__/auth-flow.js';

describe('Team Management Flow', () => {
    beforeAll(async () => {
        await launchAppWithDefaults();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
        await signOn();
    });

    it('should navigate to Start a Team', async () => {
        // Wait for dashboard to load
        await waitFor(element(by.text('START A TEAM')).atIndex(0))
            .toExist()
            .withTimeout(5000);

        await element(by.text('START A TEAM')).atIndex(0).tap();

        // Expect finding common inputs on team creation form
        await expect(element(by.id('team-name-input'))).toExist();
        await expect(element(by.id('team-description-input'))).toExist();
    });

    it('should navigate to Find a Team', async () => {
        await waitFor(element(by.text('FIND A TEAM')).atIndex(0))
            .toExist()
            .withTimeout(5000);

        await element(by.text('FIND A TEAM')).atIndex(0).tap();

        // Expect standard list or search to appear
        await expect(element(by.label('Search'))).toExist();
    });
});
