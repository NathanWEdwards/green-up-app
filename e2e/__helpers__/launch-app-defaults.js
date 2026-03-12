export async function launchAppWithDefaults() {
    await device.launchApp({
        permissions: {
            location: 'always'
        },
        newInstance: true,
        delete: true
    });
    await device.setLocation(44.477, -73.212);
}
