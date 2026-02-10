import * as Location from 'expo-location';

export async function requestLocationAccess(): Promise<Location.LocationPermissionResponse> {
    return Location.requestForegroundPermissionsAsync();
}

export async function getCurrentPosition() {
    let { status } = await requestLocationAccess();
    if (status !== 'granted') {
        return undefined;
    }
    let location = await Location.getCurrentPositionAsync({});
    return location;
}