import Address from '@/models/address';
import React, { Fragment } from 'react';
import { Text } from 'react-native';

interface SiteData {
    name?: string;
    address?: any;
    notes?: string;
}

interface TownData {
    townName?: string;
    dropOffInstructions?: string;
}

interface SiteProps {
    site: SiteData;
    town: TownData;
}

export const Site: React.FC<SiteProps> = ({ site, town }) => (
    <Fragment>
        <Text>{(town || ({} as TownData)).townName}</Text>
        <Text>{(site || ({} as SiteData)).name}</Text>
        <Text>{Address.toString((site || ({} as SiteData)).address)}</Text>
        <Text>{(site || ({} as SiteData)).notes}</Text>
        <Text>{(town || ({} as TownData)).dropOffInstructions}</Text>
    </Fragment>
);

export default Site;
