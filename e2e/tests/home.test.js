import { launchAppWithDefaults } from '@/e2e/__helpers__/launch-app-defaults.js';
import { signOn } from '@/e2e/__helpers__/auth-flow.js';

describe('(authd)/index', () => {
    beforeEach(async () => {
        await launchAppWithDefaults();
    });

    it('should display Menu, Map, and Teams tabs.', async () => {
        await signOn();
        expect(element(by.text('FIND A TEAM'))).toBeVisible();
        expect(element(by.text('START A TEAM'))).toBeVisible();
        expect(element(by.text('TOWN INFORMATION'))).toBeVisible();
        expect(element(by.text('FREE SUPPLIES'))).toBeVisible();
        expect(element(by.text('TRASH DISPOSAL'))).toBeVisible();
        expect(element(by.text('GREEN UP FACTS'))).toBeVisible();
    });
});
