import { launchAppWithDefaults } from '@/e2e/__helpers__/launch-app-defaults.js';
import { signOn } from '@/e2e/__helpers__/auth-flow.js';

describe('Trash Tracking Flow', () => {
    beforeAll(async () => {
        await launchAppWithDefaults();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should navigate to Trash Disposal map and verify rendering', async () => {
        await signOn();
        await waitFor(element(by.text('TRASH DISPOSAL')).atIndex(0))
            .toExist()
            .withTimeout(5000);

        await element(by.text('TRASH DISPOSAL')).atIndex(0).tap();

        // Validate the mini map is rendered
        await expect(element(by.id('mini-map-mock'))).toExist();
    });
});
