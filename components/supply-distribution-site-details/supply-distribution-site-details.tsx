import ButtonBar from '@/components/button-bar';
import { TextDivider } from '@/components/divider';
import MiniMap from '@/components/mini-map';
import { Caption, Subtitle, Title } from '@/components/text';
import Address from '@/models/address';
import Coordinates from '@/models/coordinates';
import { defaultStyles } from '@/styles/default-styles';
import moment from 'moment';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const myStyles = {};
const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);

interface SupplyDistributionSiteData {
    name?: string;
    notes?: string;
    start?: string;
    end?: string;
    townId?: string;
    coordinates?: { latitude: number; longitude: number };
    address?: any;
}

interface SupplyDistributionSiteDetailsProps {
    site: SupplyDistributionSiteData | null;
    closeModal: () => void;
    towns: Record<string, { name?: string }>;
}

export const SupplyDistributionSiteDetails: React.FC<
    SupplyDistributionSiteDetailsProps
> = ({ site, closeModal, towns }) => {
    if (!site) return null;
    return (
        <SafeAreaView style={styles.container}>
            <ButtonBar
                buttonConfigs={[{ text: 'CLOSE', onClick: closeModal }]}
            />
            <ScrollView style={styles.scroll}>
                <View style={{ paddingTop: 10 }}>
                    <Title>{site.name}</Title>
                    <TextDivider style={{ backgroundColor: '#FFFFFFAA' }}>
                        <Caption>{'INFORMATION'}</Caption>
                    </TextDivider>
                    <View style={{ padding: 10, backgroundColor: 'white' }}>
                        <Subtitle style={{ color: 'black' }}>
                            {(towns[site.townId || ''] || {}).name}
                        </Subtitle>
                        <Text>{site.notes}</Text>
                        <Text>
                            {site.start
                                ? moment(site.start).format(
                                      'MM DD YYYY HH:MM:A'
                                  )
                                : null}
                        </Text>
                        <Text>
                            {site.end
                                ? moment(site.end).format('MM DD YYYY HH:MM:A')
                                : null}
                        </Text>
                    </View>
                    <TextDivider style={{ backgroundColor: '#FFFFFFAA' }}>
                        <Caption>{'Location'}</Caption>
                    </TextDivider>
                    <View style={{ padding: 10, backgroundColor: 'white' }}>
                        <Subtitle style={{ textAlign: 'left', color: '#222' }}>
                            {Address.toString(site.address)}
                        </Subtitle>
                        {Boolean(
                            (site.coordinates || ({} as any)).longitude &&
                            (site.coordinates || ({} as any)).latitude
                        ) ? (
                            <MiniMap
                                initialLocation={Coordinates.create(
                                    site.coordinates
                                )}
                                pinsConfig={[
                                    {
                                        title: site.name,
                                        description: Address.toString(
                                            site.address
                                        ),
                                        coordinates: site.coordinates
                                    }
                                ]}
                            />
                        ) : null}
                    </View>
                </View>
            </ScrollView>
            <ButtonBar
                buttonConfigs={[{ text: 'CLOSE', onClick: closeModal }]}
            />
        </SafeAreaView>
    );
};

export default SupplyDistributionSiteDetails;
