import { isValidDate } from "../libs/validators";
import Address from "./address";
import Coordinates from "./coordinates";

export default class Celebration {
    name?: string;
    description?: string;
    status?: string;
    active?: boolean;
    address?: Address;
    coordinates?: Coordinates;
    created?: Date;
    start?: Date;
    end?: Date;
    townId?: string;
    id?: string;
    image?: string;

    constructor(args: any) {
        this.active = typeof args.active === "boolean" ? args.active : true;
        this.address = Address.create(typeof args.address === "string" ? JSON.parse(args.address) : args.address);
        this.coordinates = Coordinates.create(typeof args.coordinates === "string" ? JSON.parse(args.coordinates) : args.coordinates);
        this.created = isValidDate(new Date(args.created)) ? new Date(args.created) : undefined;
        this.description = typeof args.description === "string" ? args.description : null;
        this.id = typeof args.id === "string" ? args.id : null;
        this.townId = typeof args.townId === "string" ? args.townId : null;
        this.end = isValidDate(new Date(args.end)) ? new Date(args.end) : undefined;
        this.image = typeof args.image === "string" ? args.image : null;
        this.name = typeof args.name === "string" ? args.name : null;
        this.start = isValidDate(new Date(args.start)) ? new Date(args.start) : undefined;
        this.status = typeof args.status === "string" ? args.status : null;
    }

    static create(args = {}, id: any) {
        const _args: any = { ...(args || {}) };
        if (id) {
            _args.id = id;
        }
        return JSON.parse(JSON.stringify(new Celebration(_args)));
    }
}