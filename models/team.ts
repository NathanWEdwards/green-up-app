
import { getCurrentGreenUpDay } from "@/libs/green-up-day-calculators";
import { isValidDate } from "@/libs/validators";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import Location from "./location";
import TeamMember from "./team-member";

const defaultDate = moment(getCurrentGreenUpDay()).utc().format("dddd, MMMM Do YYYY");

export default class Team {
    active?: boolean;
    created: Date;
    date?: string;
    description?: string;
    end?: string;
    id?: string;
    isMember?: boolean;
    isPublic: boolean;
    location?: string;
    locations?: Location[];
    members?: Record<string, TeamMember>;
    name?: string;
    notes?: string[];
    owner: TeamMember;
    startdate?: string;
    townId?: string;
    cleanDate?: any
    cleanStartTime?: any
    cleanEndTime?: any


    constructor(args: any) {
        this.active = typeof args.active === "boolean"
            ? args.active
            : true;
        this.created = isValidDate(new Date(args.created))
            ? new Date(args.created)
            : new Date();
        this.date = typeof args.date === "string"
            ? args.date
            : defaultDate;
        this.description = typeof args.description === "string"
            ? args.description
            : null;
        this.end = typeof args.end === "string"
            ? args.end
            : null;
        this.id = typeof args.id === "string" ? args.id : null;
        this.isMember = typeof args.isMember === "boolean"
            ? args.isMember
            : false;
        this.isPublic = typeof args.isPublic === "boolean"
            ? args.isPublic
            : true;
        this.name = typeof args.name === "string"
            ? args.name
            : null;
        this.location = typeof args.location === "string"
            ? args.location
            : null;
        this.locations = Array.isArray(args.locations)
            ? args.locations.map((location: Record<string, any>): Location => Location.create(location))
            : [];
        this.members = Object.keys(args.members || {})
            .map((key: string): TeamMember => TeamMember.create({ ...args.members[key], uid: key }))
            .reduce((obj: Record<string, TeamMember>, member: TeamMember): Record<string, TeamMember> => ({ ...obj, [member.uid || uuidv4()]: member }), {});
        this.notes = typeof args.notes === "string"
            ? args.notes
            : null;
        this.owner = TeamMember.create(args.owner);
        this.startdate = typeof args.startdate === "string"
            ? args.startdate
            : null;
        this.townId = typeof args.townId === "string"
            ? args.townId
            : null;
        this.cleanDate = typeof args.cleanDate === "string"
            ? new Date(args.cleanDate)
            : null;
        this.cleanStartTime = typeof args.cleanStartTime === "string"
            ? new Date(args.cleanStartTime)
            : null;
        this.cleanEndTime = typeof args.cleanEndTime === "string"
            ? new Date(args.cleanEndTime)
            : null;
    }

    static create(args: any, id?: string): Team {
        const _args = { ...args };
        if (id) {
            _args.id = id;
        }
        return new Team(_args);
    }

}
