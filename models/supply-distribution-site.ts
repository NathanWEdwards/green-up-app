import { isValidDate } from '@/libs/validators';
import Address from './address';
import Coordinates from './coordinates';

export default class SupplyDistributionSite {
    active: boolean;
    address?: Address;
    coordinates?: Coordinates;
    created?: string;
    end?: Date;
    id?: string;
    name?: string;
    notes?: string;
    start?: Date;
    townId?: string;
    updated?: string;
    siteType?: string;
    constructor(args?: any) {
        this.active = (args || {}).active !== false;
        this.address = Address.create((args || {}).address);
        this.coordinates = Coordinates.create((args || {}).coordinates);
        this.created = (args || {}).created || null;
        this.end = isValidDate((args || {}).end) ? (args || {}).end : null;
        this.id = typeof (args || {}).id === 'string' ? (args || {}).id : null;
        this.name = (args || {}).name || '';
        this.notes = (args || {}).notes || '';
        this.start = isValidDate((args || {}).start)
            ? (args || {}).start
            : null;
        this.townId =
            typeof (args || {}).townId === 'string'
                ? (args || {}).townId
                : null;
        this.updated = (args || {}).updated || null;
        this.siteType =
            typeof (args || {}).siteType === 'string'
                ? (args || {}).siteType
                : null;
    }

    static create(args: any, id?: string): SupplyDistributionSite {
        const _args = { ...args };
        if (Boolean(id)) {
            _args.id = id;
        }
        return new SupplyDistributionSite(_args);
    }

    toJSON() {
        return {
            active: this.active,
            address: this.address,
            coordinates: this.coordinates,
            created: this.created,
            end: this.end,
            id: this.id,
            name: this.name,
            notes: this.notes,
            start: this.start,
            townId: this.townId,
            updated: this.updated,
            siteType: this.siteType
        };
    }
}
