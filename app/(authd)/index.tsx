import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/components/providers/session-provider';
import { getAllSites, nearestSites } from '@/services/sites';

export default function HomeScreen() {
  const [items, setItems] = useState<any[]>([]);
  const { signOut } = useSession();

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
    <View style={styles.menuContainer}>
      <Link href="/faqs" style={styles.menuLink}>
        <Text style={styles.menuLinkText}>FAQs</Text>
      </Link>

      <Pressable
        testID="sign-out"
        onPress={() => {
          signOut();
        }}
        style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
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
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '92%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  menuLink: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuLinkText: {
    fontSize: 16,
    color: '#1E88E5',
    textAlign: 'center',
    fontWeight: '600',
  },
  signOutButton: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  signOutButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  }
});
