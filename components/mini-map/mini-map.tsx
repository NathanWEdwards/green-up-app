import MultiLineMapCallout from '@/components/multi-line-map-callout';
import type Coordinates from '@/models/coordinates';
import { defaultStyles } from '@/styles/default-styles';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

const myStyles = {
    selected: {
        opacity: 0.5
    },
    miniMap: {
        flexGrow: 1,
        backgroundColor: 'red'
    }
};

const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);

interface LocationCoords {
    latitude: number;
    longitude: number;
}

const getLocationAsync = (): Promise<LocationCoords> =>
    Location.requestForegroundPermissionsAsync()
        .then((locationPermission) => {
            if (locationPermission.status !== 'granted') {
                throw new Error(
                    'Allow access to location for a more accurate map'
                );
            }
            return Location.getCurrentPositionAsync({});
        })
        .then((location): LocationCoords => {
            if (location) {
                return {
                    latitude: Number(location.coords.latitude),
                    longitude: Number(location.coords.longitude)
                };
            }
            throw new Error('Location is not available');
        });

export interface MapPinConfig {
    coordinates?: { latitude: number; longitude: number };
    title?: string;
    description?: string;
    color?: string;
    callout?: React.ReactNode;
    onPress?: (index: number) => void;
    onCalloutPress?: (index: number) => void;
}

interface MiniMapProps {
    initialLocation?: Coordinates;
    onMapClick?: (coordinate: any) => void;
    pinsConfig?: MapPinConfig[];
    layers?: any[];
    style?: Record<string, any>;
    refKey?: any;
}

export const MiniMap: React.FC<MiniMapProps> = ({
    initialLocation,
    onMapClick,
    pinsConfig = [],
    style,
    refKey
}) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [initialMapLocation, setInitialMapLocation] =
        useState<any>(initialLocation);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        if (!initialMapLocation) {
            if (Platform.OS === 'android' && !Constants.isDevice && false) {
            } else {
                getLocationAsync()
                    .then((location: LocationCoords) => {
                        setInitialMapLocation({
                            latitude: Number(location.latitude),
                            longitude: Number(location.longitude),
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421
                        });
                    })
                    .catch((e: Error) => {
                        // Fail gracefully and set initial location to the Vermont Green Up HQ in Montpelier
                        setInitialMapLocation({
                            latitude: 44.263278,
                            longitude: -72.6534249,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1
                        });
                        console.log('Error: ' + e);
                        Alert.alert(e.message || String(e));
                    });
            }
        }
    }, [mapReady]);

    const placePins = (pins: MapPinConfig[] = []): React.ReactElement[] =>
        mapReady
            ? (pins || [])
                  .map(
                      (
                          pin: MapPinConfig,
                          index: number
                      ): React.ReactElement => (
                          <Marker
                              coordinate={pin.coordinates!}
                              key={`pin${index}`}
                              pinColor={pin.color || 'red'}
                              stopPropagation={true}
                              onPress={() => {
                                  if (pin.onPress) {
                                      pin.onPress(index);
                                  }
                              }}
                          >
                              {pin.callout || (
                                  <MultiLineMapCallout
                                      onPress={() => {
                                          if (pin.onCalloutPress) {
                                              pin.onCalloutPress(index);
                                          }
                                      }}
                                      title={pin.title || ''}
                                      description={
                                          typeof pin.description === 'string'
                                              ? pin.description
                                              : ''
                                      }
                                  />
                              )}
                          </Marker>
                      )
                  )
                  .concat(
                      initialMapLocation
                          ? [
                                <Marker
                                    key="userLocation"
                                    coordinate={{
                                        latitude:
                                            initialMapLocation.latitude || 0.0,
                                        longitude:
                                            initialMapLocation.longitude || 0.0
                                    }}
                                    pinColor={'blue'}
                                />
                            ]
                          : []
                  )
            : [];

    const handleMapClick = (e: MapPressEvent) => {
        if (onMapClick) {
            onMapClick(e.nativeEvent.coordinate);
            placePins(pinsConfig);
        }
    };
    return !errorMessage ? (
        <MapView
            onMapReady={() => {
                setMapReady(true);
            }}
            style={{
                minHeight: 100,
                minWidth: 100,
                height: 300,
                width: '100%',
                ...(style || {})
            }}
            initialRegion={initialMapLocation}
            onPress={handleMapClick}
            pitchEnabled={false}
        >
            {placePins(pinsConfig)}
        </MapView>
    ) : (
        <View style={styles.miniMap}>
            <Text
                style={{
                    minHeight: 100,
                    minWidth: 100,
                    height: 300,
                    width: '100%',
                    ...(style || {})
                }}
            >
                {errorMessage}
            </Text>
        </View>
    );
};

export default MiniMap;
