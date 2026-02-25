function validateEmail(email: string): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getEmail(emails: any): string | undefined {
    switch (true) {
        case Array.isArray(emails):
            const myEmail = emails
                .filter((email: any): boolean => !!email && validateEmail(email.email))
                .map((email: any): string => email.email)[0] || undefined;
            return (typeof myEmail === "string")
                ? myEmail.toLowerCase()
                : myEmail;
        case typeof emails === "string" && validateEmail(emails):
            return emails.toLowerCase();
        default:
            return undefined;
    }
}

function getPhoneNumber(phoneNumbers: any): string | undefined {
    switch (true) {
        case Array.isArray(phoneNumbers):
            return phoneNumbers
                .filter((phoneNumber: any): boolean => !!phoneNumber)
                .map((phoneNumber: any): string => phoneNumber.number)[0] || undefined;
        case typeof phoneNumbers === "string":
            return phoneNumbers;
        default:
            return undefined;
    }
}

export default class Contact {
    uid?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    isSelected: boolean;

    constructor(args: any) {
        this.uid = typeof args.uid === "string"
            ? args.uid
            : null;
        this.firstName = typeof args.firstName === "string"
            ? args.firstName
            : null;
        this.lastName = typeof args.lastName === "string"
            ? args.lastName
            : null;
        this.email = getEmail(args.email || args.emails);
        this.phoneNumber = getPhoneNumber(args.phoneNumber || args.phoneNumbers || args.phone);
        this.isSelected = typeof args.isSelected === "boolean"
            ? args.isSelected
            : false;
    }

    static create(args?: any, uid?: string): Contact{
        const _args = { ...(args || { uid: "" }) };
        if (Boolean(uid)) {
            _args.uid = uid;
        }
        return JSON.parse(JSON.stringify(new Contact(_args)));
    }
}
