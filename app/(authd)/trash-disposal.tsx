import React, { useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import MiniMap from '@/components/mini-map';
import TagToggle from '@/components/tag-toggle';
import { removeNulls } from '@/libs/remove-nulls';
import TrashDrop from '@/models/trash-drop';
import User from '@/models/user';
import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import { defaultStyles } from '@/styles/default-styles';
import { useAppSelector } from '@/store/hooks';
import { useAddTrashDropsMutation } from '@/store/apis/trashApi';
import { useGetAssignedTeamsQuery } from '@/store/apis/teamApi';
import * as constants from '@/styles/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
    ...(defaultStyles as any),
    wizardOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    wizardCard: {
        width: SCREEN_WIDTH * 0.9,
        maxHeight: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10
    },
    wizardHeader: {
        backgroundColor: constants.colorBackgroundDark,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    wizardHeaderTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
    },
    wizardStepIndicator: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13
    },
    wizardBody: {
        padding: 20
    },
    wizardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    footerButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center'
    },
    primaryButton: {
        backgroundColor: constants.colorBackgroundDark
    },
    secondaryButton: {
        backgroundColor: '#ddd'
    },
    cancelButton: {
        backgroundColor: 'transparent'
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15
    },
    secondaryButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 15
    },
    cancelButtonText: {
        color: constants.colorTextError,
        fontWeight: '500',
        fontSize: 14
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12
    },
    pinCard: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee'
    },
    pinMapPreview: {
        width: 100,
        height: 100
    },
    pinDetails: {
        flex: 1,
        padding: 12,
        justifyContent: 'center'
    },
    pinCoords: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    stepperButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: constants.colorBackgroundDark,
        justifyContent: 'center',
        alignItems: 'center'
    },
    stepperButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 22
    },
    stepperValue: {
        fontSize: 18,
        fontWeight: '600',
        marginHorizontal: 16,
        minWidth: 24,
        textAlign: 'center'
    },
    bagLabel: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9'
    },
    successIcon: {
        alignSelf: 'center',
        marginBottom: 12
    }
});

type WizardStep = 'team' | 'tags' | 'bags' | 'done' | null;

export default function TrashDisposal(): React.ReactNode {
    const [addTrashDrops] = useAddTrashDropsMutation();

    const loginUser = useAppSelector(selectUser) || {};
    const profile = useAppSelector(selectProfile) || {};
    const currentUser = User.create({ ...loginUser, ...removeNulls(profile) });

    const { data: assignedTeams } = useGetAssignedTeamsQuery(
        currentUser.uid!,
        {
            selectFromResult: (result) => ({
                ...result,
                data: result.data ?? {}
            })
        }
    );

    const hasTeams = useMemo(
        () => Object.keys(assignedTeams).length > 0,
        [assignedTeams]
    );

    // Wizard state
    const [wizardStep, setWizardStep] = useState<WizardStep>(null);
    const [pendingPins, setPendingPins] = useState<
        { latitude: number; longitude: number }[]
    >([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [bagCounts, setBagCounts] = useState<number[]>([]);

    // Derived "drop" object for TagToggle compatibility
    const tagDrop = useMemo(() => ({ tags: selectedTags }), [selectedTags]);

    const totalSteps = hasTeams ? 3 : 2;

    const currentStepNumber = useMemo(() => {
        if (wizardStep === 'team') return 1;
        if (wizardStep === 'tags') return hasTeams ? 2 : 1;
        if (wizardStep === 'bags') return hasTeams ? 3 : 2;
        return 0;
    }, [wizardStep, hasTeams]);

    const handleConfirm = useCallback(
        (pins: { latitude: number; longitude: number }[]) => {
            setPendingPins(pins);
            setBagCounts(pins.map(() => 1));
            setSelectedTeamId('');
            setSelectedTags([]);
            setWizardStep(hasTeams ? 'team' : 'tags');
        },
        [hasTeams]
    );

    const cancelWizard = useCallback(() => {
        setWizardStep(null);
        setPendingPins([]);
    }, []);

    const toggleTag = useCallback(
        (tag: string) => () => {
            setSelectedTags((prev) =>
                prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
            );
        },
        []
    );

    const updateBagCount = useCallback(
        (index: number, delta: number) => {
            setBagCounts((prev) => {
                const updated = [...prev];
                updated[index] = Math.max(1, updated[index] + delta);
                return updated;
            });
        },
        []
    );

    const handleSubmit = useCallback(async () => {
        const drops = pendingPins.map((pin, i) =>
            TrashDrop.create({
                active: true,
                location: {
                    coordinates: {
                        latitude: pin.latitude,
                        longitude: pin.longitude
                    }
                },
                createdBy: { uid: currentUser.uid, email: currentUser.email },
                bagCount: bagCounts[i] || 1,
                tags: selectedTags,
                teamId: selectedTeamId || null,
                created: new Date()
            })
        );
        await addTrashDrops(drops);
        setWizardStep('done');
    }, [
        pendingPins,
        bagCounts,
        selectedTags,
        selectedTeamId,
        currentUser,
        addTrashDrops
    ]);

    const closeWizard = useCallback(() => {
        setWizardStep(null);
        setPendingPins([]);
        setBagCounts([]);
        setSelectedTags([]);
        setSelectedTeamId('');
    }, []);

    // --- Step renderers ---

    const renderTeamStep = () => (
        <View>
            <Text style={styles.sectionLabel}>
                Select a team for these trash drops (optional)
            </Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={selectedTeamId}
                    onValueChange={(val: string) => setSelectedTeamId(val)}
                    mode="dropdown"
                >
                    <Picker.Item label="No Team" value="" />
                    {Object.entries(assignedTeams).map(([id, team]: [string, any]) => (
                        <Picker.Item key={id} label={team.name || id} value={id} />
                    ))}
                </Picker>
            </View>
        </View>
    );

    const renderTagsStep = () => (
        <View>
            <Text style={styles.sectionLabel}>
                Tag these trash drops (optional)
            </Text>
            <TagToggle
                tag="bio-waste"
                text="Needles/Bio-Waste"
                drop={tagDrop}
                style={{ marginVertical: 6, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10 }}
                onToggle={toggleTag('bio-waste')}
            />
            <TagToggle
                tag="tires"
                text="Tires"
                drop={tagDrop}
                style={{ marginVertical: 6, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10 }}
                onToggle={toggleTag('tires')}
            />
            <TagToggle
                tag="large"
                text="Large Object"
                drop={tagDrop}
                style={{ marginVertical: 6, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10 }}
                onToggle={toggleTag('large')}
            />
        </View>
    );

    const renderBagsStep = () => (
        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>
                How many bags at each location?
            </Text>
            {pendingPins.map((pin, index) => (
                <View key={`pin-${index}`} style={styles.pinCard}>
                    <MapView
                        style={styles.pinMapPreview}
                        initialRegion={{
                            latitude: pin.latitude,
                            longitude: pin.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        liteMode={true}
                    >
                        <Marker
                            coordinate={pin}
                            pinColor={constants.colorBackgroundDark}
                        />
                    </MapView>
                    <View style={styles.pinDetails}>
                        <Text style={styles.pinCoords}>
                            Pin {index + 1} — {pin.latitude.toFixed(4)},{' '}
                            {pin.longitude.toFixed(4)}
                        </Text>
                        <View style={styles.stepperRow}>
                            <TouchableOpacity
                                style={styles.stepperButton}
                                onPress={() => updateBagCount(index, -1)}
                            >
                                <Text style={styles.stepperButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepperValue}>
                                {bagCounts[index]}
                            </Text>
                            <TouchableOpacity
                                style={styles.stepperButton}
                                onPress={() => updateBagCount(index, 1)}
                            >
                                <Text style={styles.stepperButtonText}>+</Text>
                            </TouchableOpacity>
                            <Text style={styles.bagLabel}>
                                bag{bagCounts[index] !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    const renderSuccessStep = () => (
        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <MaterialCommunityIcons
                name="check-circle"
                size={64}
                color={constants.colorBackgroundDark}
                style={styles.successIcon}
            />
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: '700',
                    marginBottom: 8,
                    textAlign: 'center',
                    color: '#333'
                }}
            >
                Great work!
            </Text>
            <Text
                style={{
                    fontSize: 15,
                    color: '#666',
                    textAlign: 'center',
                    lineHeight: 22
                }}
            >
                Your {pendingPins.length} trash drop
                {pendingPins.length !== 1 ? 's have' : ' has'} been recorded.
            </Text>
        </View>
    );

    const stepTitle = useMemo(() => {
        switch (wizardStep) {
            case 'team':
                return 'Select Team';
            case 'tags':
                return 'Tag Items';
            case 'bags':
                return 'Bag Count';
            case 'done':
                return 'Success';
            default:
                return '';
        }
    }, [wizardStep]);

    const goNext = useCallback(() => {
        if (wizardStep === 'team') setWizardStep('tags');
        else if (wizardStep === 'tags') setWizardStep('bags');
        else if (wizardStep === 'bags') handleSubmit();
    }, [wizardStep, handleSubmit]);

    const goBack = useCallback(() => {
        if (wizardStep === 'tags' && hasTeams) setWizardStep('team');
        else if (wizardStep === 'bags') setWizardStep('tags');
    }, [wizardStep, hasTeams]);

    const canGoBack =
        (wizardStep === 'tags' && hasTeams) || wizardStep === 'bags';

    return (
        <SafeAreaView style={[styles.container, { flex: 1 }]}>
            <MiniMap
                allowUserPins={true}
                fullscreen={true}
                onConfirm={handleConfirm}
            />
            <Modal
                animationType="fade"
                transparent={true}
                visible={wizardStep !== null}
                onRequestClose={
                    wizardStep === 'done' ? closeWizard : cancelWizard
                }
            >
                <View style={styles.wizardOverlay}>
                    <View style={styles.wizardCard}>
                        {/* Header */}
                        <View style={styles.wizardHeader}>
                            <Text style={styles.wizardHeaderTitle}>
                                {stepTitle}
                            </Text>
                            {wizardStep !== 'done' && (
                                <Text style={styles.wizardStepIndicator}>
                                    Step {currentStepNumber} of {totalSteps}
                                </Text>
                            )}
                        </View>

                        {/* Body */}
                        <View style={styles.wizardBody}>
                            {wizardStep === 'team' && renderTeamStep()}
                            {wizardStep === 'tags' && renderTagsStep()}
                            {wizardStep === 'bags' && renderBagsStep()}
                            {wizardStep === 'done' && renderSuccessStep()}
                        </View>

                        {/* Footer */}
                        <View style={styles.wizardFooter}>
                            {wizardStep === 'done' ? (
                                <>
                                    <View />
                                    <TouchableOpacity
                                        style={[
                                            styles.footerButton,
                                            styles.primaryButton
                                        ]}
                                        onPress={closeWizard}
                                    >
                                        <Text style={styles.primaryButtonText}>
                                            Done
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.footerButton,
                                            styles.cancelButton
                                        ]}
                                        onPress={cancelWizard}
                                    >
                                        <Text style={styles.cancelButtonText}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={{ flexDirection: 'row' }}>
                                        {canGoBack && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.footerButton,
                                                    styles.secondaryButton,
                                                    { marginRight: 8 }
                                                ]}
                                                onPress={goBack}
                                            >
                                                <Text
                                                    style={
                                                        styles.secondaryButtonText
                                                    }
                                                >
                                                    Back
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={[
                                                styles.footerButton,
                                                styles.primaryButton
                                            ]}
                                            onPress={goNext}
                                        >
                                            <Text
                                                style={
                                                    styles.primaryButtonText
                                                }
                                            >
                                                {wizardStep === 'bags'
                                                    ? 'Submit'
                                                    : 'Next'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
