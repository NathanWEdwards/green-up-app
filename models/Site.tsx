export type SiteArgs = {
    id?: string;
    name?: string;
    address?: {
        city?: string;
        notes?: string;
        state?: string;
        street?: string;
        street2?: string;
        zip?: string;
    }
    coordinates?: {
        latitude: number;
        longitude: number;
    };
};

export default class Site {
    id?: string;
    name?: string;
    address?: {
        city?: string;
        notes?: string;
        state?: string;
        street?: string;
        street2?: string;
        zip?: string;
    }
    coordinates?: {
        latitude: number;
        longitude: number;
    };

    constructor(args: SiteArgs = {}) {
        this.id = typeof args['id'] === 'string' ? args['id'] : undefined;
        this.name = typeof args['name'] === 'string' ? args['name'] : undefined;
        this.address = typeof args['address'] === 'object' ? args['address'] : undefined; 
        this.coordinates = typeof args['coordinates'] === 'object' ? args['coordinates'] : undefined; 
    }

    static create(args: SiteArgs = {}): Site {
        return new Site(args);
    }
}