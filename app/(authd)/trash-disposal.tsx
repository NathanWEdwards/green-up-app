import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MiniMap from '@/components/mini-map';
import { dropTrash } from '@/data-sources/firebase-data-layer';
import { removeNulls } from '@/libs/remove-nulls';
import TrashDrop from '@/models/trash-drop';
import User from '@/models/user';
import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import { defaultStyles } from '@/styles/default-styles';
import { useAppSelector } from '@/store/hooks';

const styles = StyleSheet.create(defaultStyles as any);

export default function TrashDisposal(): React.ReactNode {
    const [modalVisible, setModalVisible] = useState(false);
    const loginUser = useAppSelector(selectUser) || {};
    const profile = useAppSelector(selectProfile) || {};
    const currentUser = User.create({ ...loginUser, ...removeNulls(profile) });

    const handleConfirm = (pins: { latitude: number; longitude: number }[]) => {
        pins.forEach((pin) => {
            const drop = TrashDrop.create({
                active: true,
                location: {
                    coordinates: {
                        latitude: pin.latitude,
                        longitude: pin.longitude
                    }
                },
                createdBy: { uid: currentUser.uid, email: currentUser.email },
                bagCount: 1,
                created: new Date()
            });
            dropTrash(drop);
        });
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={[styles.container, { flex: 1 }]}>
            <MiniMap
                allowUserPins={true}
                fullscreen={true}
                onConfirm={handleConfirm}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View
                    style={[
                        styles.modal,
                        {
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.5)'
                        }
                    ]}
                >
                    <View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: 'white',
                                padding: 20,
                                width: '80%',
                                borderRadius: 10
                            }
                        ]}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                marginBottom: 15,
                                textAlign: 'center'
                            }}
                        >
                            Great work! Your trash drop locations have been
                            recorded.
                        </Text>
                        <Button
                            title="Close"
                            onPress={() => setModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
