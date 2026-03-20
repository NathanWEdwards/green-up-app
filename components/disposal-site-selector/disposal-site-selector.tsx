import colors from '@/constants/colors';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, View } from 'react-native';
import { searchArray } from '../../libs/search';
import type Location from '../../models/location';
import TrashCollectionSite from '../../models/trash-collection-site';
import SearchBar from '../search-bar';
import { TownDisposalDetails } from '../town-disposal-details/town-disposal-details';
import TownListItem from '../town-list-item';
import TrashInfo from '../trash-info';

const searchableFields = ['name', 'townName', 'address', 'townId'];

type TownInfoType = {
    townName?: string;
    notes?: string;
    allowsRoadside: boolean;
    townId: string;
    dropOffInstructions?: string;
    collectionSites: TrashCollectionSite[];
};

type PropsType = { userLocation: Location; townInfo: TownInfoType[] };

export const DisposalSiteSelector = ({
    userLocation,
    townInfo
}: PropsType): React.ReactElement<any> => {
    const [selectedTown, setSelectedTown] = useState<any>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchResults, setSearchResults] = useState(townInfo);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const spotsFound = searchArray(searchableFields, townInfo, searchTerm);
        setSearchResults(spotsFound);
    }, [searchTerm, townInfo]);

    return (
        <View
            style={{
                borderTopWidth: 2,
                borderColor: 'white',
                borderStyle: 'solid'
            }}
        >
            <SearchBar
                help={<TrashInfo />}
                searchTerm={searchTerm}
                search={setSearchTerm}
                userLocation={userLocation}
            />
            <FlatList
                style={{ backgroundColor: colors.backgroundLight }}
                data={searchTerm ? searchResults : townInfo}
                renderItem={({ item }) => (
                    <TownListItem
                        town={item as any}
                        onClick={() => {
                            setSelectedTown(item as any);
                            setIsModalVisible(true);
                        }}
                    />
                )}
            />
            <Modal
                animationType={'slide'}
                onRequestClose={(): string =>
                    'this function is required. Who knows why?'
                }
                transparent={false}
                visible={isModalVisible}
            >
                <TownDisposalDetails
                    closeModal={() => {
                        setIsModalVisible(false);
                    }}
                    town={selectedTown as any}
                />
            </Modal>
        </View>
    );
};
