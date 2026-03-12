import { isValidDate } from "../libs/validators";
import Coordinates from "./coordinates";

export default class Location {
    name?: string;
    description?: string;
    status?: string;
    active?: boolean;
    townId?: string;
    coordinates?: Coordinates;
    created?: Date;

    constructor(args: any) {
        this.name = typeof args.name === "string" ? args.name : null;
        this.description = typeof args.description === "string" ? args.description : null;
        this.status = typeof args.status === "string" ? args.status : null;
        this.active = typeof args.active === "boolean" ? args.active : true;
        this.coordinates = Coordinates.create(args.coordinates);
        this.created = isValidDate(new Date(args.created)) ? new Date(args.created) : undefined;
        this.townId = typeof args.townId === "string" ? args.townId : null;
    }

    static create(args?: any): Location {
        return JSON.parse(JSON.stringify(new Location(args || {})));
    }
}