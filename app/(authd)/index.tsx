import { router } from 'expo-router';
import * as R from 'ramda';
import React, { useCallback, useMemo } from 'react';
import {
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { daysUntilCurrentGreenUpDay } from '@/libs/green-up-day-calculators';
import { getUsersTeams } from '@/libs/team-helpers';
import Team from '@/models/team';
import User from '@/models/user';
import { selectUser } from '@/store/slices/loginSlice';
import { useGetTeamsQuery } from '@/store/apis/teamApi';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';
import { useAppSelector } from '@/store/hooks';

const styles = StyleSheet.create({
    ...(defaultStyles as any),
    column: {
        width: '50%',
        height: 150,
        margin: 0,
        padding: 0,
        marginBottom: 2.5,
        marginTop: 0
    },
    leftColumn: {
        paddingLeft: 5,
        paddingRight: 2.5
    },
    rightColumn: {
        paddingLeft: 2.5,
        paddingRight: 5
    },
    featuredWrapper: {
        width: '100%',
        height: 120,
        marginBottom: 5
    },
    featuredTouchable: {
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderColor: constants.colorBackgroundDark
    },
    featuredImageBg: {
        height: 120,
        borderWidth: 0,
        overflow: 'hidden'
    },
    featuredImageStyle: {
        height: 200,
        top: 0
    },
    featuredOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    featuredLabel: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'Rubik-Bold',
        textAlign: 'center'
    },
    featuredDescription: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'Rubik-Regular',
        fontWeight: 'bold'
    },
    gridTouchable: {
        overflow: 'hidden',
        width: '100%',
        height: '100%'
    },
    gridImageWrapper: {
        backgroundColor: '#fff'
    },
    gridImage: {
        height: 100,
        width: '100%'
    },
    gridTextWrapper: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    gridLabel: {
        fontFamily: 'Rubik-Regular',
        textAlign: 'center',
        fontSize: 17
    },
    gridDescription: {
        fontFamily: 'Rubik-Regular',
        textAlign: 'center'
    }
});

const homeTitle = R.cond([
    [
        (days: number): boolean => days > 1,
        (days: number): string => `${days} days until Green Up Day`
    ],
    [
        (days: number): boolean => days === 1,
        (): string => 'Tomorrow is Green Up Day!'
    ],
    [(days: number): boolean => days === 0, (): string => 'Green Up Today!'],
    [(days: number): boolean => days < 0, (): string => 'Keep on Greening']
])(daysUntilCurrentGreenUpDay());

const isOwner = (
    teams: { [key: string]: Team },
    user: User,
    teamId: string
): boolean => {
    const teamOwner = (teams[teamId] || {}).owner;
    const userIsOwner = teamOwner && teamOwner.uid === user.uid;
    return userIsOwner;
};

// Static menu config entries (images are resolved at bundle time, safe to keep outside)
const staticMenuImages = {
    findATeam: {
        backgroundImage: require('../../assets/images/girls-wide.jpg'),
        backgroundImageLarge: require('../../assets/images/girls-large.jpg')
    },
    createATeam: {
        backgroundImage: require('../../assets/images/ford-wide.jpg'),
        backgroundImageLarge: require('../../assets/images/ford-large.jpg')
    },
    townInformation: {
        backgroundImage: require('../../assets/images/dump-truck-wide.jpg'),
        backgroundImageLarge: require('../../assets/images/dump-truck-large.jpg')
    },
    freeSupplies: {
        backgroundImage: require('../../assets/images/car-wide.jpg'),
        backgroundImageLarge: require('../../assets/images/car-large.jpg')
    },
    trashDisposal: {
        backgroundImage: require('../../assets/images/covered-bridge-wide.jpg'),
        backgroundImageLarge: require('../../assets/images/covered-bridge-large.jpg')
    },
    greenUpFacts: {
        backgroundImage: require('../../assets/images/posters-wide.jpg'),
        backgroundImageLarge: require('../../assets/images/posters-large.jpg')
    }
};

const teamImages = [
    {
        backgroundImage: require('../../assets/images/govenor-wide.jpg'),
        backgroundImageLarge: require('../../assets/images/govenor-large.jpg')
    },
    {
        backgroundImage: require('../../assets/images/royalton-bandstand-wide.jpg'),
        backgroundImageLarge: require('../../assets/images/royalton-bandstand-large.jpg')
    }
];

export default function HomeScreen() {
    const user = User.create(useAppSelector(selectUser));
    const { data: teams } = useGetTeamsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const myTeams = getUsersTeams(user, teams);

    const menuItems = useMemo(() => {
        const menuConfig: Record<string, any> = {
            findATeam: {
                order: myTeams.length === 0 ? 1 : 200,
                navigation: 'find-team',
                label: 'Find A Team',
                description: "Who's cleaning where.",
                ...staticMenuImages.findATeam
            },
            createATeam: {
                order: myTeams.length === 0 ? 2 : 301,
                navigation: 'new-team',
                label: 'Start A Team',
                description: 'Be a team captain',
                ...staticMenuImages.createATeam
            },
            townInformation: {
                order: 400,
                navigation: 'town-information',
                label: 'Town Information',
                description: 'Cleanup Details',
                ...staticMenuImages.townInformation
            },
            freeSupplies: {
                order: 401,
                navigation: 'free-supplies',
                label: 'Free Supplies',
                description: 'Get gloves and bags',
                ...staticMenuImages.freeSupplies
            },
            trashDisposal: {
                order: 500,
                navigation: 'trash-disposal',
                label: 'Trash Disposal',
                description: 'Mark on map where you put trash bags',
                ...staticMenuImages.trashDisposal
            },
            greenUpFacts: {
                order: 403,
                navigation: 'greenup-facts',
                label: 'Green Up Facts',
                description: 'All about Green Up Day',
                ...staticMenuImages.greenUpFacts
            }
        };

        // Build team buttons
        const teamButtons: Record<string, any> = {};
        myTeams.forEach((team: any, index: number) => {
            teamButtons[team.id] = {
                order: 20,
                navigation: isOwner(teams, user, team.id || 'foo')
                    ? '/team-editor'
                    : '/team-details',
                label: team.name || 'My Team',
                description: isOwner(teams, user, team.id || 'foo')
                    ? 'Manage Your Team'
                    : 'About Your Team',
                ...teamImages[index % 2]
            };
        });

        const buttonConfigs = { ...menuConfig, ...teamButtons };

        // Sort and map to final shape
        const sorted = Object.entries(buttonConfigs).sort(
            (a: any, b: any) => a[1].order - b[1].order
        );
        return sorted.map((entry: [string, any]) => ({
            onPress: () => {
                if (entry[1].beforeNav) {
                    entry[1].beforeNav();
                }
                router.push(entry[1].navigation);
            },
            label: entry[1].label,
            backgroundImage: entry[1].backgroundImage,
            backgroundImageLarge: entry[1].backgroundImageLarge,
            description: entry[1].description,
            id: entry[0],
            key: entry[0]
        }));
    }, [teams, user, myTeams]);

    const headerComponentItem = menuItems.length > 0 ? menuItems[0] : null;
    const footerComponentItem =
        menuItems.length > 1 ? menuItems[menuItems.length - 1] : null;
    const gridItems = useMemo(
        () =>
            menuItems.slice(1, menuItems.length > 1 ? menuItems.length - 1 : 1),
        [menuItems]
    );

    const renderFeatured = useCallback((rowData: any) => {
        return (
            <View style={styles.featuredWrapper}>
                <TouchableOpacity
                    key={rowData.item.id}
                    onPress={rowData.item.onPress}
                    style={styles.featuredTouchable}
                >
                    <ImageBackground
                        style={styles.featuredImageBg}
                        imageStyle={styles.featuredImageStyle}
                        resizeMode="cover"
                        source={rowData.item.backgroundImageLarge}
                    >
                        <View style={styles.featuredOverlay}>
                            <Text style={styles.featuredLabel}>
                                {rowData.item.label.toUpperCase()}
                            </Text>
                            <Text style={styles.featuredDescription}>
                                {rowData.item.description}
                            </Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        );
    }, []);

    const renderOne = useCallback((rowData: any) => {
        const leftColumn = rowData.index % 2 === 0;
        return (
            <View
                style={[
                    styles.column,
                    leftColumn ? styles.leftColumn : styles.rightColumn
                ]}
            >
                <TouchableOpacity
                    key={rowData.item.id}
                    onPress={rowData.item.onPress}
                    style={styles.gridTouchable}
                >
                    <View style={styles.gridImageWrapper}>
                        <Image
                            resizeMode="contain"
                            style={styles.gridImage}
                            source={rowData.item.backgroundImage}
                        />
                        <View style={styles.gridTextWrapper}>
                            <Text style={styles.gridLabel} numberOfLines={1}>
                                {rowData.item.label.toUpperCase()}
                            </Text>
                            <View>
                                <Text style={styles.gridDescription}>
                                    {rowData.item.description}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }, []);

    const keyExtractor = useCallback((item: any) => item.id, []);

    const headerComponent = useMemo(
        () =>
            headerComponentItem
                ? renderFeatured({ item: headerComponentItem })
                : null,
        [headerComponentItem, renderFeatured]
    );

    const footerComponent = useMemo(
        () =>
            footerComponentItem
                ? renderFeatured({ item: footerComponentItem })
                : null,
        [footerComponentItem, renderFeatured]
    );

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: constants.colorBackgroundDark }
            ]}
        >
            <FlatList
                data={gridItems}
                renderItem={renderOne}
                horizontal={false}
                numColumns={2}
                keyExtractor={keyExtractor}
                ListHeaderComponent={headerComponent}
                ListFooterComponent={footerComponent}
            ></FlatList>
        </SafeAreaView>
    );
}

HomeScreen.navigationOptions = {
    title: homeTitle,
    headerStyle: {
        backgroundColor: constants.colorBackgroundDark,
        borderWidth: 0
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
        fontFamily: 'Rubik-Regular',
        fontWeight: 'bold',
        fontSize: 20,
        color: constants.colorHeaderText
    },
    headerBackTitleStyle: {
        fontFamily: 'Rubik-Regular',
        fontWeight: 'bold',
        fontSize: 20,
        color: constants.colorHeaderText
    }
};
