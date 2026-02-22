import { View } from 'react-native';

import { useSession } from '@/components/providers/session-provider';


export default function Index() {
    const { signOut } = useSession();

    return (
        <View />
    )
}