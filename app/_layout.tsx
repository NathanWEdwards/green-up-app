import { Drawer } from 'expo-router/drawer';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer>
      <Drawer.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="modal"
        options={{ title: 'Modal' }}
      />
    </Drawer>
  );
}
