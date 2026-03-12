(global as any).navigator = {
    geolocation: {
        getCurrentPosition: jest.fn((success) =>
            success({
                coords: {
                    latitude: 44.477,
                    longitude: -73.212,
                    accuracy: 1,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null,
                    toJSON: function () {
                        throw new Error('Function not implemented.');
                    }
                },
                timestamp: 0,
                toJSON: function () {
                    throw new Error('Function not implemented.');
                }
            })
        ),
        watchPosition: jest.fn(),
        clearWatch: jest.fn()
    }
};
