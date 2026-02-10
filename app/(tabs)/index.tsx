import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { getAllSites, nearestSites } from '@/services/sites';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const loadSites = async () => {
      try {
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

  return (
    <View style={styles.picker}>
      <Text>Supplies & Waste Dropoff Sites</Text>
      <DropDownPicker
        testID="site-picker"
        placeholder="Select"
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        containerStyle={{ height: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  picker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  }
});
