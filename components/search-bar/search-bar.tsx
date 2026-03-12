import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableHighlight,
    View
} from 'react-native';
import { defaultStyles } from '../../styles/default-styles';

const localStyles = {
    searchBar: {
        margin: 10,
        padding: 0,
        marginBottom: 2,
        height: 45
    },
    searchTerm: {
        backgroundColor: 'white',
        textAlign: 'left' as const,
        padding: 10
    },
    iconStyle: {
        height: 40,
        width: 40,
        padding: 2,
        color: 'white',
        textAlign: 'center' as const
    },
    modalWrapper: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999999999
    },
    modalView: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 0,
        alignItems: 'center' as const
    }
};
const styles = StyleSheet.create(
    Object.assign({}, defaultStyles, localStyles) as any
);

interface SearchBarProps {
    help?: React.ReactNode;
    searchTerm?: string;
    search: (term: string) => void;
    userLocation?: { townId?: string } | null;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    help,
    userLocation,
    searchTerm = '',
    search
}) => {
    const [helpOpen, setHelpOpen] = useState(false);
    return (
        <View style={styles.searchBar}>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                }}
            >
                <Ionicons
                    name={
                        Platform.OS === 'ios'
                            ? 'help-circle-outline'
                            : 'help-circle-outline'
                    }
                    size={36}
                    style={styles.iconStyle}
                    onPress={() => setHelpOpen(true)}
                />
                <View>
                    <View style={styles.modalWrapper}>
                        <Modal
                            visible={helpOpen}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setHelpOpen(false)}
                        >
                            <View style={styles.modalView}>{help}</View>
                            <Pressable
                                style={{
                                    position: 'absolute',
                                    top: 40,
                                    right: 10,
                                    borderStyle: 'solid',
                                    borderColor: '#AAA',
                                    borderRadius: 40,
                                    borderWidth: 1,
                                    backgroundColor: '#FFF',
                                    padding: 10,
                                    height: 50,
                                    width: 50,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5
                                }}
                                onPress={() => setHelpOpen(false)}
                            >
                                <Ionicons
                                    name={
                                        Platform.OS === 'ios'
                                            ? 'close'
                                            : 'close'
                                    }
                                    size={30}
                                    color="#888"
                                />
                            </Pressable>
                        </Modal>
                    </View>
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        paddingTop: 2
                    }}
                >
                    <TextInput
                        keyboardType={'default'}
                        onChangeText={search}
                        placeholder={'Search'}
                        style={styles.searchTerm}
                        value={searchTerm}
                        underlineColorAndroid={'transparent'}
                    />
                </View>
                <TouchableHighlight
                    onPress={() => {
                        search('');
                    }}
                    style={{
                        height: 36,
                        width: 40,
                        paddingLeft: 2,
                        paddingRight: 2,
                        paddingBottom: 2,
                        marginLeft: 2
                    }}
                >
                    <Ionicons
                        name={
                            Platform.OS === 'ios'
                                ? 'close-circle-outline'
                                : 'close-circle-outline'
                        }
                        size={36}
                        style={styles.iconStyle}
                    />
                </TouchableHighlight>
                <TouchableHighlight
                    onPress={() => {
                        search(userLocation?.townId || '');
                    }}
                    style={{
                        height: 36,
                        width: 40,
                        paddingLeft: 2,
                        paddingRight: 2,
                        paddingBottom: 2,
                        marginLeft: 2
                    }}
                >
                    <Ionicons
                        name={'locate'}
                        size={36}
                        style={styles.iconStyle}
                    />
                </TouchableHighlight>
            </View>
        </View>
    );
};
