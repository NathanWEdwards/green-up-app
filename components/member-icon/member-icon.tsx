import * as memberStatuses from '@/constants/team-member-statuses';
import * as constants from '@/styles/constants';
import { Ionicons } from '@expo/vector-icons';
import * as R from 'ramda';
import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';

const icons: Record<string, string> = {
    [memberStatuses.REQUEST_TO_JOIN]:
        Platform.OS === 'ios' ? 'ios-person-add' : 'md-person-add',
    [memberStatuses.ACCEPTED]:
        Platform.OS === 'ios' ? 'ios-person' : 'md-person',
    [memberStatuses.INVITED]: Platform.OS === 'ios' ? 'ios-mail' : 'md-mail',
    [memberStatuses.OWNER]: Platform.OS === 'ios' ? 'ios-star' : 'md-star',
    [memberStatuses.NOT_INVITED]:
        Platform.OS === 'ios' ? 'ios-close' : 'md-close',
    IS_REQUESTING_TO_JOIN: Platform.OS === 'ios' ? 'ios-clock' : 'md-clock',
    DEFAULT: Platform.OS === 'ios' ? 'ios-help' : 'md-help'
};

interface MemberStatus {
    status: string;
    isOwner: boolean;
}

const getIconName = R.cond([
    [
        (s: MemberStatus): boolean => s.isOwner === true,
        (): string => icons.OWNER
    ],
    [
        (s: MemberStatus): boolean =>
            s.status === memberStatuses.REQUEST_TO_JOIN,
        (): string => icons.IS_REQUESTING_TO_JOIN
    ],
    [
        (s: MemberStatus): boolean => Object.keys(icons).includes(s.status),
        (s: MemberStatus): string => icons[s.status]
    ],
    [R.T, (): string => icons.DEFAULT]
]);

interface MemberIconProps {
    memberStatus: string;
    style?: StyleProp<ViewStyle>;
    isOwner?: boolean;
    size?: number;
}

export const MemberIcon: React.FC<MemberIconProps> = ({
    memberStatus,
    style = {},
    isOwner,
    size = 35
}) => {
    const status =
        memberStatus === memberStatuses.REQUEST_TO_JOIN && !isOwner
            ? 'IS_REQUESTING_TO_JOIN'
            : memberStatus;
    const iconStyle = {
        height: size,
        width: size,
        color: constants.colorIcon,
        ...(style as Record<string, any>)
    };
    return (
        <Ionicons
            name={getIconName({ status, isOwner: Boolean(isOwner) }) as any}
            size={size}
            style={iconStyle}
        />
    );
};

export default MemberIcon;
