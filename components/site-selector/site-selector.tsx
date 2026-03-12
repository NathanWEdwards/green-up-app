import ButtonBar from '@/components/button-bar';
import MiniMap from '@/components/mini-map';
import Site from '@/components/site';
import { getClosestSite } from '@/libs/geo-helpers';
import Location from '@/models/location';
import React, { useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TownEntry {
    townId: string;
    townName?: string;
    dropOffInstructions?: string;
}

interface SiteEntry {
    id?: string;
    name?: string;
    coordinates?: { latitude: number; longitude: number };
    townId?: string;
    address?: any;
    notes?: string;
}

interface SiteSelectorProps {
    onSelect: (site: SiteEntry) => void;
    close: () => void;
    userLocation?: Location;
    sites?: SiteEntry[];
    towns: TownEntry[];
    value?: SiteEntry;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({
    sites,
    towns,
    userLocation,
    onSelect,
    close,
    value
}) => {
    const [selectedSite, setSelectedSite] = useState<SiteEntry | undefined>(
        value
    );

    const pins = (sites || [])
        .filter((site) => Boolean(site.coordinates))
        .map((site) => ({
            coordinates: site.coordinates,
            title:
                (
                    towns.find(
                        (t: TownEntry): boolean => t.townId === site.townId
                    ) || ({} as TownEntry)
                ).townName || '',
            id: site.id,
            description: site.name,
            onPress: () => {
                setSelectedSite(site);
            },
            color: 'yellow'
        }));

    const town = towns.find(
        (t: TownEntry): boolean =>
            t.townId === (selectedSite || ({} as SiteEntry)).townId
    );
    const headerButtons = [
        {
            text: 'Select',
            onClick: () => {
                if (selectedSite) {
                    onSelect(selectedSite);
                }
            }
        },
        { text: 'Cancel', onClick: close }
    ];

    return (
        <SafeAreaView>
            <ButtonBar buttonConfigs={headerButtons} />
            <View style={{ height: Dimensions.get('window').height - 60 }}>
                <View
                    style={{
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderBottomWidth: 1,
                        borderStyle: 'solid',
                        borderColor: '#EEE',
                        paddingTop: 10,
                        paddingLeft: 10,
                        paddingRight: 10,
                        height: 80
                    }}
                >
                    {!selectedSite ? (
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: 16
                            }}
                        >
                            <Text style={{ fontSize: 20, textAlign: 'center' }}>
                                {'Select A Trash Collection Site'}
                            </Text>
                        </View>
                    ) : (
                        <Site site={selectedSite} town={town as any} />
                    )}
                </View>
                <MiniMap
                    initialLocation={{
                        ...((selectedSite || ({} as SiteEntry)).coordinates ||
                            getClosestSite(
                                sites as any,
                                ((userLocation as any) || {}).coordinates || {}
                            ).site.coordinates),
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421
                    }}
                    pinsConfig={pins as any}
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'stretch'
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

export default SiteSelector;
