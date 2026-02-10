

jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('expo-location');
jest.mock('expo-modules-core');

describe('getCurrentPosition', () => {
    test('returns a location object when permissions are granted', async () => {
        const expectedLatitude = 44.477;
        const expectedLongitude = -73.212;
        const locationService = require("@/services/location");
        const location = await locationService.getCurrentPosition();
        expect(location).toBeTruthy();
        expect(location).toHaveProperty('coords');
        expect(location!.coords).toHaveProperty('latitude', expectedLatitude);
        expect(location!.coords).toHaveProperty('longitude', expectedLongitude);
        expect(location!.coords.latitude).toEqual(expectedLatitude);
        expect(location!.coords.longitude).toEqual(expectedLongitude);
    });
});