import { LocationObject } from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { getCurrentPosition } from '@/services/location';
import { nearestSites } from '@/services/sites';

export default function Explore() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [items, setItems] = useState<{ label: string; value: string; latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    const fetchPosition = async () => {
      const position = await getCurrentPosition();
      setLocation(position || null);
    }
    const fetchSites = async () => {
      const sites = await nearestSites();
      setItems(sites);
    };
    fetchPosition();
    fetchSites();
  }, []);


  return (
    <View style={styles.container}>

      { location && <MapView
        testID='map'
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
          coordinate={{ latitude: 44.47, longitude: -73.212 }}
          title={"My Marker"}
          description={"Some description"}
        />
      </MapView>
    }
    </View>
  );
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
    flex: 1,
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
