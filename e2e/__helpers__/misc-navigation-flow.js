export async function dismissLocationPermission() {
    if (device.getPlatform() === 'ios') {
        await element(by.text('Allow Once')).tap();
    }
}

export async function dismissSavePassword() {
    if (device.getPlatform() === 'ios') {
        await element(by.text('Not Now')).tap();
    }
}
