async function signOn() {
    try {
        await element(by.id('sign-out')).tap();
    } catch (error) {}
    const platform = await device.getPlatform();
    await element(by.id('email-input')).tap();
    await element(by.id('email-input')).typeText(process.env.TEST_USER_EMAIL);
    await element(by.id('password-input')).tap();
    await element(by.id('password-input')).typeText(process.env.TEST_USER_PASSWORD);
    if (platform === 'ios') {
        await element(by.id('password-input')).tapReturnKey();
    } else {
        await device.pressBack();
    }
    await element(by.id('submit-button')).tap();
    if (platform === 'ios') {
        await device.tap({ x:   120, y: 530 }); // Dismiss password prompt.
    }
    await waitFor(element(by.text('Menu'))).toBeVisible().withTimeout(10000);
}

module.exports = {
    signOn: signOn
};