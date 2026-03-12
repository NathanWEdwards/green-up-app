import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Linking,
    Modal,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import PickupLocation from "@/components/pickup-location/pickup-location";
import SearchBar from "@/components/search-bar";
import SupplyDistributionSiteDetails from "@/components/supply-distribution-site-details";
import WatchGeoLocation from "@/components/watch-geo-location";
import colors from "@/constants/colors";
import { searchArray } from "@/libs/search";
import SupplyDistributionSite from "@/models/supply-distribution-site";
import { selectSupplyDistributionSites } from "@/store/slices/supplyDistributionSitesSlice";
import { selectTownData } from "@/store/slices/townsSlice";
import { selectUserLocation } from "@/store/slices/userLocationSlice";
import * as constants from "@/styles/constants";
import { defaultStyles } from "@/styles/default-styles";

const myStyles = {
    details: {
        fontWeight: "bold" as const,
    },
    noTeamsFound: {
        flex: 1,
        justifyContent: "center" as const,
    },
    noTeamsFoundWrapper: {
        backgroundColor: "#FFFFFF44",
        width: "100%" as const,
        padding: 20,
    },
    noTeamsFoundText: {
        fontSize: 30,
        color: constants.colorTextThemeLight,
        textShadowColor: `${constants.colorTextThemeDark}`,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
        lineHeight: 36,
    },
    teamDetail: {
        color: constants.colorTextThemeLight,
        fontSize: 14,
    },
};
const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);

const searchableFields = ["name", "address", "townId"];

const FreeSupplies: React.FC = () => {
    const sites = useSelector(selectSupplyDistributionSites);
    const userLocation = useSelector(selectUserLocation);
    const towns = useSelector(selectTownData) || {};

    const pickupSpots = useMemo(() => {
        const spotsList = Object.entries(sites).map(
            ([id, data]: [string, any]) => SupplyDistributionSite.create(data, id)
        );
        return spotsList.filter(
            (site: SupplyDistributionSite) => site.townId != null
        );
    }, [sites]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchResults, setSearchResults] = useState<SupplyDistributionSite[]>(pickupSpots);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSite, setSelectedSite] = useState<SupplyDistributionSite | null>(null);

    useEffect(() => {
        const spotsFound = searchArray(searchableFields, pickupSpots, searchTerm).sort(
            (a: any, b: any) => {
                const aTown = (a.townId || "").toLowerCase();
                const bTown = (b.townId || "").toLowerCase();
                return aTown < bTown ? -1 : 1;
            }
        );
        // Attach townName for display purposes
        spotsFound.forEach((item: any) => {
            try {
                item.townName = towns[item.townId]?.name ?? "";
            } catch (ex) {
                console.log("Error resolving town name for item:", item.townId);
            }
        });
        setSearchResults(spotsFound);
    }, [searchTerm, pickupSpots, towns]);

    const hasResults = searchResults.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <WatchGeoLocation />
            <Text
                onPress={() => {
                    Linking.openURL(
                        "https://greenup.powershift.info/wp-content/uploads/2021/03/Safety-Card.jpg"
                    );
                }}
                style={{
                    fontSize: 18,
                    fontFamily: "Rubik-Bold",
                    textAlign: "center",
                    color: "white",
                    marginLeft: 10,
                    marginTop: 10,
                    marginRight: 10,
                }}
            >
                Tap Here For Safety Information!
            </Text>
            <Text
                onPress={() => {
                    Linking.openURL(
                        "https://greenup.powershift.info/wp-content/uploads/2021/03/Safety-Card.jpg"
                    );
                }}
                style={{
                    fontSize: 16,
                    fontFamily: "Rubik-Bold",
                    textAlign: "center",
                    color: "white",
                    marginLeft: 30,
                    marginTop: 5,
                    marginRight: 30,
                }}
            >
                Remember! Clean up Vermont with safe social distance, gloves and
                masks.
            </Text>
            <SearchBar
                searchTerm={searchTerm}
                search={setSearchTerm}
                userLocation={userLocation}
            />
            <View
                style={{
                    flex: 1,
                    backgroundColor: constants.colorBackgroundLight,
                }}
            >
                {hasResults ? (
                    <FlatList
                        style={{ backgroundColor: colors.backgroundLight }}
                        data={searchResults}
                        keyExtractor={(item: any) => item.id || item.townId}
                        renderItem={({ item }) => (
                            <PickupLocation
                                item={item}
                                onClick={() => {
                                    setSelectedSite(item);
                                    setIsModalVisible(true);
                                }}
                            />
                        )}
                    />
                ) : (
                    <View>
                        <Text style={styles.noTeamsFoundText as any}>
                            {"Sorry, we couldn't find any matching supply sites."}
                        </Text>
                        <Text style={{ marginTop: 10 }}>
                            {"Try a different search"}
                        </Text>
                    </View>
                )}
            </View>
            <Modal
                animationType="slide"
                onRequestClose={() => { }}
                transparent={false}
                visible={isModalVisible}
            >
                <SupplyDistributionSiteDetails
                    site={selectedSite as any}
                    closeModal={() => {
                        setIsModalVisible(false);
                    }}
                    towns={towns}
                />
            </Modal>
        </SafeAreaView>
    );
};

export default FreeSupplies;
