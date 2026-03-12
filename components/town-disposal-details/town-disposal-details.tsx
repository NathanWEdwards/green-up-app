import ButtonBar from "@/components/button-bar";
import MiniMap from "@/components/mini-map";
import { Subtitle, Text, Title } from "@/components/text";
import Address from "@/models/address";
import Coordinates from "@/models/coordinates";
import TrashCollectionSite from "@/models/trash-collection-site";
import * as constants from "@/styles/constants";
import { defaultStyles } from "@/styles/default-styles";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import React, { Fragment } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const myStyles = {
    location: {
        padding: 5,
        width: "100%",
        borderStyle: "solid" as const,
        borderColor: "#BBB",
        borderWidth: 1,
        marginLeft: 2,
        marginRight: 2
    },

    locationName: { fontSize: 24 },
    allowsRoadside: { fontSize: 20, color: "black", marginBottom: 5 },
    townName: { fontSize: 20, color: "#666", width: "100%", marginBottom: 10 }
};
const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);


interface TownDisposalData {
    townName?: string;
    notes?: string;
    allowsRoadside: boolean;
    townId: string;
    dropOffInstructions?: string;
    pickupInstructions?: string;
    collectionSites: TrashCollectionSite[];
    updated?: string;
}

interface TownDisposalDetailsProps {
    town: TownDisposalData;
    closeModal: () => void;
}

export const TownDisposalDetails: React.FC<TownDisposalDetailsProps> = ({ town, closeModal }) => (
    <SafeAreaView style={styles.container}>
        <ButtonBar buttonConfigs={[{ text: "CLOSE", onClick: closeModal }]} />
        <ScrollView style={styles.scroll}>

            <View style={{ backgroundColor: "white", height: 30, borderTopRightRadius: 20, borderTopLeftRadius: 20, marginTop: 20 }}>
                <Title
                    style={{ color: constants.colorBackgroundDark, textAlign: "center", fontFamily: "Rubik-Bold", marginTop: 5, fontSize: 24 }}>
                    {town.townName}
                </Title>
            </View>
            {Boolean(town.notes) &&
                (
                    <View style={{ padding: 10, backgroundColor: "white", marginTop: 5 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "left", color: "black" }}>Notes: </Text>
                        <Text style={{ color: "black", marginLeft: 20 }}>{town.notes}</Text>
                    </View>
                )
            }
            {Boolean(town.pickupInstructions) &&
                (
                    <View style={{ padding: 10, backgroundColor: "white", marginTop: 5 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "left", color: "black" }}>Pickup Instructions: </Text>
                        <Text style={{ color: "black", marginLeft: 20 }}>{town.pickupInstructions}</Text>
                    </View>
                )
            }
            <View style={{ padding: 10, backgroundColor: "white", marginTop: 5 }}>
                {
                    town.dropOffInstructions &&
                    (
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "left", color: "black" }}>Drop Off Instructions: </Text>
                            <Text style={{ color: "black", marginLeft: 20 }}>{town.dropOffInstructions}</Text>
                        </View>
                    )
                }
                <View style={{ flex: 1, flexDirection: "row", marginTop: 10, marginBottom: 10, }}>
                    <View style={{ position: "relative", height: 60, width: 60 }}>
                        {
                            !(town.allowsRoadside) &&
                            <FontAwesome style={{ color: "#AAA", position: "absolute" }} size={65} name={"ban"} />
                        }
                        <FontAwesome style={{ color: "#555", position: "absolute", top: 15, left: 12 }} size={30} name={"road"} />
                    </View>
                    <View style={{ flexGrow: 1, flexShrink: 1, marginLeft: 5 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 19 }}>
                                {
                                    town.allowsRoadside ? "You may drop your bags along the roadside." : "Roadside drop-off is not allowed. Please take your trash to the nearest collection site."
                                }
                            </Text>
                        </View>
                    </View>
                </View>

            </View>

            {
                (town.collectionSites || []).length > 0
                    ? (
                        <Fragment>
                            <View style={{ padding: 10, backgroundColor: "white", marginTop: 5 }}>
                                <Text style={{ marginLeft: "auto", marginRight: "auto", width: 300, textAlign: "center", fontFamily: "Rubik-Bold", marginTop: 5, fontSize: 18 }}>{"Please drop trash off at one of the following locations:"}</Text>
                            </View>
                            {(town.collectionSites || []).map(site => (
                                <View key={site.id} style={{ padding: 10, backgroundColor: "white", marginTop: 5 }}>
                                    <Subtitle style={{ textAlign: 'left', color: '#222' }}>{site.name}</Subtitle>
                                    {
                                        Boolean(site.start || site.end) && (
                                            <View style={{ marginTop: 5 }}>
                                                <Text>Hours of Operation </Text>
                                                <Text>{`${site.start && moment(site.start).format("MM DD YYYY HH:MM:A")} to ${site.end && moment(site.end).format("MM DD YYYY HH:MM:A")}`}</Text>
                                            </View>
                                        )
                                    }
                                    {
                                        Boolean(site.notes) && (
                                            <View style={{ marginTop: 5 }}>
                                                <Text>{site.notes}</Text>
                                            </View>
                                        )
                                    }
                                    <Subtitle style={{ textAlign: 'left', color: '#222', marginTop: 5 }}>{Address.toString(site.address as any)}</Subtitle>
                                    {
                                        Boolean((site.coordinates || {} as any).longitude && (site.coordinates || {} as any).latitude)
                                            ? (
                                                <MiniMap
                                                    initialLocation={Coordinates.create(site.coordinates)}
                                                    pinsConfig={[{
                                                        title: site.name,
                                                        description: Address.toString(site.address as any),
                                                        coordinates: site.coordinates as { latitude: number; longitude: number }
                                                    }]} />
                                            )
                                            : null
                                    }
                                </View>
                            ))}
                        </Fragment>
                    )
                    : null
            }
            {Boolean(town.updated) &&
                (
                    <View style={{ padding: 10, backgroundColor: "white", marginTop: 5, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", textAlign: "center", color: "black" }}>Last Updated: <Text style={{ color: "black", fontSize: 12 }}>{town.updated}</Text></Text>

                    </View>
                )
            }
        </ScrollView>
        <ButtonBar buttonConfigs={[{ text: "CLOSE", onClick: closeModal }]} />
    </SafeAreaView>);


export default TownDisposalDetails;
