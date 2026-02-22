import { LocationObject } from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import ActionChooser from '@/components/ui/action-chooser';
import { getCurrentPosition } from '@/services/location';
import { getAllSites, nearestSites } from '@/services/sites';

export default function Explore() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [items, setItems] = useState<{ label: string; value: string; latitude: number; longitude: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);


  useEffect(() => {
      const loadSites = async () => {
        try {
          const position = await getCurrentPosition();
          setLocation(position || null);
          const sites = await nearestSites();
          setItems(sites);
        } catch (error) {
          try {
            let sites: any[] = [];
            const allSites = await getAllSites();
            allSites.forEach(site => {
              if (site.name && site.id) {
                sites.push({
                    label: site.name,
                    value: site.id,
                    testID: site.id
                });
              }
            });
            setItems(sites);
          } catch (error) {
          }
        }
      };
      loadSites();
    }, []);


    if (location) {
      return (
          <MapView
            accessibilityLabel='Map view'
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.09,
              longitudeDelta: 0.09,
            }}>
            {items.map((site) => (
              <Marker
                key={site.value}
                coordinate={{ latitude: site.latitude, longitude: site.longitude }}
                title={site.label}
              />
            ))}
            <Marker
              coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              title={""}
              description={""}
            >
              <View style={styles.picker}>
                <Text
                  testID="map-view-text"
                  style={{ fontSize: 16, fontWeight: 'bold' }}
                >
                  I want to ...
                </Text>
                <ActionChooser />
              </View>
            </Marker>
          </MapView>
      );
    }
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    // flex: 1,
    position: 'absolute'
  },
  map: {
    width: '100%',
    height: '100%',
  },
  picker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  }
});
