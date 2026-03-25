import { PrimaryButton } from '@/components/button/button';
import * as constants from '@/styles/constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
    buttons: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        height: '100%'
    },
    buttonBarHeader: {
        width: '100%',
        height: 55,
        backgroundColor: constants.colorBackgroundHeader,
        borderBottomWidth: 1,
        borderColor: 'black',
        borderTopWidth: 1,
        borderTopColor: constants.colorBackgroundDark
    }
});

export interface ButtonConfigType {
    text: string;
    onClick: () => void;
}

interface ButtonBarProps {
    buttonConfigs: ButtonConfigType[];
}

export const ButtonBar: React.FC<ButtonBarProps> = ({ buttonConfigs }) => (
    <View style={styles.buttonBarHeader}>
        <View style={styles.buttons}>
            {buttonConfigs.map((config: ButtonConfigType, index: number) => (
                <PrimaryButton
                    key={index}
                    onPress={config.onClick}
                    style={{ width: `${100 / buttonConfigs.length}%` }}
                >
                    <Text>{config.text.toUpperCase()}</Text>
                </PrimaryButton>
            ))}
        </View>
    </View>
);

export default ButtonBar;
