import { isValidDate } from '../libs/validators';
import Address from './address';
import Coordinates from './coordinates';

export default class TrashCollectionSite {
    active: boolean;
    address?: Address;
    coordinates?: Coordinates;
    end?: Date;
    id?: string;
    name?: string;
    notes?: string;
    start?: Date;
    townId?: string;
    created?: string;
    updated?: string;
    constructor(args?: any) {
        this.active = (args || {}).active !== false;
        this.address = Address.create((args || {}).address);
        this.coordinates = Coordinates.create((args || {}).coordinates);
        this.end = isValidDate((args || {}).end) ? (args || {}).end : null;
        this.id = typeof args.id === 'string' ? args.id : null;
        this.name = (args || {}).name || '';
        this.notes = (args || {}).notes || '';
        this.start = isValidDate((args || {}).start)
            ? (args || {}).start
            : null;
        this.townId =
            typeof args.townId === 'string' ? (args || {}).townId : null;
        this.created = (args || {}).created || null;
        this.updated = (args || {}).updated || null;
    }

    static create(args?: any, id?: string): TrashCollectionSite {
        const _args = { ...args };
        if (Boolean(id)) {
            _args.id = id;
        }
        return JSON.parse(JSON.stringify(new TrashCollectionSite(_args)));
    }
}
