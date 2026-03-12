export default class FAQ {
    answer?: string;
    image?: number;
    question?: string;
    sortOrder?: boolean;

    constructor(args: any) {
        this.answer = typeof args.answer === 'string' ? args.answer : null;
        this.image = typeof args.image === 'number' ? args.image : null;
        this.question =
            typeof args.question === 'string' ? args.question : null;
        this.sortOrder =
            typeof args.sortOrder === 'number' ? args.sortOrder : null;
    }

    static create(args: any, id?: string): FAQ {
        const _args = { ...args };
        if (Boolean(id)) {
            _args.id = id;
        }
        return JSON.parse(JSON.stringify(new FAQ(_args)));
    }
}
