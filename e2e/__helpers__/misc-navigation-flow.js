export async function dismissLocationPermission() {
    if (device.getPlatform() === 'ios') {
        await element(by.text('Allow Once')).tap();
    }
}

export async function dismissSavePassword() {
    if (device.getPlatform() === 'ios') {
        try {
            await element(by.text('Not Now')).tap();
        } catch (e) {}
        try {
            // Fallback coordinate tap for some iOS password prompts
            await device.tap({ x: 120, y: 530 });
        } catch (e) {}
    } else {
        try {
            await element(by.text('NO THANKS')).tap();
        } catch (e) {}
        try {
            await element(by.text('No thanks')).tap();
        } catch (e) {}
        try {
            await element(by.text('Never')).tap();
        } catch (e) {}
        try {
            await element(by.text('NEVER')).tap();
        } catch (e) {}
    }
}
