import { mockCredentials } from '@/e2e/mocks/firebase-auth.js';
import { dismissSavePassword } from '@/e2e/__helpers__/misc-navigation-flow.js';

async function signOn() {
    try {
        await element(by.id('sign-out')).tap();
    } catch (error) {}
    const platform = await device.getPlatform();
    await element(by.id('email-input')).tap();
    await element(by.id('email-input')).typeText(mockCredentials.email);
    await element(by.id('password-input')).tap();
    await element(by.id('password-input')).typeText(mockCredentials.password);
    // Close keyboard to ensure element is visible
    if (platform === 'ios') {
        await element(by.id('password-input')).tapReturnKey();
    } else {
        await device.pressBack();
    }
    await element(by.id('login-button')).tap();
    await dismissSavePassword();
}

module.exports = {
    signOn: signOn
};
