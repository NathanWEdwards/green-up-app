import TeamDetailsEditor from '@/components/team-details-editor';
import TeamMembersEditor from '@/components/team-members-editor';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

const myStyles = {};
const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles as any);

const routes = [
    { key: 'details', title: 'Details' },
    { key: 'members', title: 'Members' }
];

const renderScene = SceneMap({
    details: TeamDetailsEditor,
    members: TeamMembersEditor
});

const TeamEditorScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const navState = { index: activeTab, routes };

    return (
        <SafeAreaView style={styles.container}>
            <TabView
                renderTabBar={(props) => (
                    <TabBar
                        {...(props as any)}
                        indicatorStyle={{
                            backgroundColor: constants.colorBackgroundDark
                        }}
                        style={{
                            backgroundColor: constants.colorBackgroundHeader
                        }}
                        renderLabel={({ route, focused }: any) => (
                            <Text
                                style={{
                                    margin: 8,
                                    color: focused ? 'black' : '#555'
                                }}
                            >
                                {(route.title || '').toUpperCase()}
                            </Text>
                        )}
                    />
                )}
                navigationState={navState}
                renderScene={renderScene}
                onIndexChange={setActiveTab}
                initialLayout={{ width: Dimensions.get('window').width }}
            />
        </SafeAreaView>
    );
};

export default TeamEditorScreen;
