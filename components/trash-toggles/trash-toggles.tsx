import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toggle from '../toggle';
import circleTurquoise from '../../assets/images/circle-turquoise.png';
import circleBlue from '../../assets/images/circle-blue.png';
import circleRed from '../../assets/images/circle-red.png';
import circleYellow from '../../assets/images/circle-yellow.png';
import circleGreen from '../../assets/images/circle-green.png';
import circleOrange from '../../assets/images/circle-orange.png';

import {
    toggleTrashOption,
    selectMyTrashToggle,
    selectUncollectedTrashToggle,
    selectTrashDropOffToggle,
    selectSupplyPickupToggle,
    selectCollectedTrashToggle,
    selectCleanAreasToggle
} from '@/store/slices/trashTrackerSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export const TrashToggles: React.FC = () => {
    const dispatch = useAppDispatch();

    const myTrashToggle = useAppSelector(selectMyTrashToggle);
    const uncollectedTrashToggle = useAppSelector(selectUncollectedTrashToggle);
    const trashDropOffToggle = useAppSelector(selectTrashDropOffToggle);
    const supplyPickupToggle = useAppSelector(selectSupplyPickupToggle);
    const collectedTrashToggle = useAppSelector(selectCollectedTrashToggle);
    const cleanAreasToggle = useAppSelector(selectCleanAreasToggle);

    const toggle = (key: string) => {
        dispatch(toggleTrashOption(key));
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                marginRight: 10,
                marginLeft: 10,
                justifyContent: 'flex-start',
                alignContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.0)'
            }}
        >
            <View
                style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    flex: 0.4,
                    justifyContent: 'space-between',
                    padding: 10
                }}
            >
                <Toggle
                    icon={circleYellow}
                    label="My Trash"
                    value={myTrashToggle}
                    onValueChange={() => toggle('myTrashToggle')}
                />
                <Toggle
                    icon={circleRed}
                    label="Uncollected Trash"
                    value={uncollectedTrashToggle}
                    onValueChange={() => toggle('uncollectedTrashToggle')}
                />
                <Toggle
                    icon={circleBlue}
                    label="Trash Drop-Offs"
                    value={trashDropOffToggle}
                    onValueChange={() => toggle('trashDropOffToggle')}
                />
                <Toggle
                    icon={circleGreen}
                    label="Supply Pickups"
                    value={supplyPickupToggle}
                    onValueChange={() => toggle('supplyPickupToggle')}
                />
                <Toggle
                    icon={circleTurquoise}
                    label="Collected Trash"
                    value={collectedTrashToggle}
                    onValueChange={() => toggle('collectedTrashToggle')}
                />
                <Toggle
                    icon={circleOrange}
                    label="Team Cleaning Areas"
                    value={cleanAreasToggle}
                    onValueChange={() => toggle('cleanAreasToggle')}
                />
            </View>
        </SafeAreaView>
    );
};
