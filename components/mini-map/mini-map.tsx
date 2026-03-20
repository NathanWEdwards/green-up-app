import MultiLineMapCallout from '@/components/multi-line-map-callout';
import type Coordinates from '@/models/coordinates';
import { defaultStyles } from '@/styles/default-styles';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as constants from '@/styles/constants';

const myStyles = {
    selected: {
        opacity: 0.5
    },
    miniMap: {
        flexGrow: 1
    },
    button: {
        borderRadius: 18,
        backgroundColor: constants.colorBackgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        minWidth: 90
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22
    },
    card: {
        maxHeight: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10
    },
    header: {
        backgroundColor: constants.colorBackgroundDark,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textBlock: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 20
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalRow: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    headerTitle: {
        color: '#fff'
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
    draggable?: boolean;
    onDragEnd?: (coordinate: any, index: number) => void;
}

interface MiniMapProps {
    initialLocation?: Coordinates;
    onMapClick?: (coordinate: any) => void;
    pinsConfig?: MapPinConfig[];
    layers?: any[];
    style?: Record<string, any>;
    refKey?: any;
    allowUserPins?: boolean;
    fullscreen?: boolean;
    onConfirm?: (pins: { latitude: number; longitude: number }[]) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
    initialLocation,
    onMapClick,
    pinsConfig = [],
    style,
    refKey,
    allowUserPins = false,
    fullscreen = false,
    onConfirm
}) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [initialMapLocation, setInitialMapLocation] =
        useState<any>(initialLocation);
    const [mapReady, setMapReady] = useState(false);
    const [userPins, setUserPins] = useState<
        { latitude: number; longitude: number }[]
    >([]);
    const [infoModalVisible, setInfoModalVisible] = useState(false);

    useEffect(() => {
        if (!initialMapLocation) {
            if (Platform.OS === 'android' && !Constants.isDevice && false) {
            } else {
                getLocationAsync()
                    .then((location: LocationCoords) => {
                        setInitialMapLocation({
                            latitude: Number(location.latitude),
                            longitude: Number(location.longitude),
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01
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
                              draggable={pin.draggable}
                              onDragEnd={(e: any) => {
                                  if (pin.onDragEnd) {
                                      pin.onDragEnd(
                                          e.nativeEvent.coordinate,
                                          index
                                      );
                                  }
                              }}
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
                  .concat(
                      (userPins || []).map((coord, index) => (
                          <Marker
                              key={`userPin_${coord.latitude}_${coord.longitude}`}
                              coordinate={coord}
                              pinColor="green"
                              onPress={() => {
                                  const newPins = [...userPins];
                                  newPins.splice(index, 1);
                                  setUserPins(newPins);
                              }}
                          />
                      ))
                  )
            : [];

    const handleMapClick = (e: MapPressEvent) => {
        // Prevent adding a new pin if the user is just tapping an existing marker
        if (e.nativeEvent.action === 'marker-press') {
            return;
        }

        if (allowUserPins) {
            setUserPins([...userPins, e.nativeEvent.coordinate]);
        }
        if (onMapClick) {
            onMapClick(e.nativeEvent.coordinate);
        }
    };
    return !errorMessage ? (
        <View style={{ flex: 1, position: 'relative', width: '100%' }}>
            <MapView
                key={`map_${refKey || 'default'}`}
                onMapReady={() => {
                    setMapReady(true);
                }}
                style={{
                    minHeight: 100,
                    minWidth: 100,
                    height: fullscreen ? '100%' : 300,
                    width: '100%',
                    ...(style || {})
                }}
                initialRegion={initialMapLocation}
                onPress={handleMapClick}
                pitchEnabled={false}
            >
                {placePins(pinsConfig)}
            </MapView>

            {allowUserPins && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: 'white',
                        padding: 10,
                        borderRadius: 20,
                        zIndex: 10,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84
                    }}
                    onPress={() => setInfoModalVisible(true)}
                >
                    <MaterialCommunityIcons
                        name="information-variant"
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
            )}

            {allowUserPins && userPins.length > 0 && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        alignSelf: 'center',
                        backgroundColor: '#4CAF50',
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 25,
                        zIndex: 10,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84
                    }}
                    onPress={() => {
                        if (onConfirm) {
                            onConfirm([...userPins]);
                            setUserPins([]); // Clear them from the map after confirmation
                        }
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 16
                        }}
                    >
                        Confirm {userPins.length} Pin
                        {userPins.length !== 1 ? 's' : ''}
                    </Text>
                </TouchableOpacity>
            )}

            <Modal
                animationType="fade"
                transparent={true}
                visible={infoModalVisible}
                onRequestClose={() => setInfoModalVisible(false)}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                >
                    <View style={[styles.card]}>
                        <View style={styles.header}>
                            <Text
                                style={[
                                    styles.headerTitle,
                                    {
                                        fontSize: 22,
                                        fontWeight: 'bold',
                                        marginBottom: 10
                                    }
                                ]}
                            >
                                Map Instructions
                            </Text>
                        </View>
                        <Text style={styles.textBlock}>
                            Tap anywhere on the map to add a new pin.
                        </Text>
                        <Text style={styles.textBlock}>
                            Tap on a pin you added to remove it.
                        </Text>
                        <View style={styles.modalRow}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => setInfoModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
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
