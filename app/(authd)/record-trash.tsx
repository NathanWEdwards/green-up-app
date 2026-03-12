import * as R from "ramda";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import EnableLocationServices from "@/components/enable-location-services";
import TrashDropForm from "@/components/trash-drop-form";
import WatchGeoLocation from "@/components/watch-geo-location";
import TrashDrop from "@/models/trash-drop";
import { defaultStyles } from "@/styles/default-styles";

import { selectUser } from "@/store/slices/loginSlice";
import { selectTownData } from "@/store/slices/townsSlice";
import { selectTrashCollectionSites } from "@/store/slices/trashCollectionSitesSlice";
import { selectUserLocation } from "@/store/slices/userLocationSlice";

const styles = StyleSheet.create(defaultStyles as any);

const RecordTrashScreen: React.FC = () => {
    const currentUser = useSelector(selectUser) || {};
    const townData = useSelector(selectTownData);
    const trashCollectionSites = useSelector(selectTrashCollectionSites);
    const userLocation = useSelector(selectUserLocation);

    const [drop, setDrop] = useState<any>({
        id: undefined as string | undefined,
        location: {},
        tags: [] as string[],
        bagCount: 1,
        wasCollected: false,
        createdBy: { uid: currentUser?.uid, email: currentUser?.email },
    });

    useEffect(() => {
        setDrop((prev: any) => ({
            ...prev,
            createdBy: { uid: currentUser?.uid, email: currentUser?.email },
        }));
    }, [currentUser?.uid, currentUser?.email]);

    const closeModal = () => {
        const newDrop = TrashDrop.create({
            id: null,
            location: {},
            tags: [],
            bagCount: 1,
            wasCollected: false,
            createdBy: { uid: currentUser?.uid, email: currentUser?.email },
        });
        setDrop(newDrop);
    };

    const saveTrashDrop = (myDrop: any, mode: string) => {
        // TODO: wire up to RTK thunk when map action creators are migrated
        closeModal();
    };

    const initialMapLocation = userLocation?.coordinates
        ? {
            latitude: Number(userLocation.coordinates.latitude),
            longitude: Number(userLocation.coordinates.longitude),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }
        : null;

    const content = R.cond([
        [
            () => Boolean(userLocation?.error),
            () => <EnableLocationServices errorMessage={userLocation?.error} />,
        ],
        [
            () => !initialMapLocation,
            () => (
                <View style={[styles.frame, { display: "flex", justifyContent: "center" }]}>
                    <Text style={{ fontSize: 20, color: "white", textAlign: "center" }}>
                        {"...Locating You"}
                    </Text>
                </View>
            ),
        ],
        [
            R.T,
            () => (
                <TrashDropForm
                    existingDrop={drop}
                    onSave={saveTrashDrop}
                />
            ),
        ],
    ])();

    return (
        <SafeAreaView style={styles.container}>
            <WatchGeoLocation />
            {content}
        </SafeAreaView>
    );
};

export default RecordTrashScreen;