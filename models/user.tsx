import anonymous from '@/assets/images/anonymous.png';
import { isValidDate } from '@/libs/validators';
import md5 from 'md5-hash';

export const defaultAvatar = anonymous;
export const getGravatar = (email: string): string =>
    !email
        ? defaultAvatar
        : `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=mm`;

export default class User {
    uid?: string;
    displayName?: string;
    updated?: Date;
    email?: string;
    photoURL?: string;
    teams?: Record<string, any>;
    bio?: string;
    created?: Date;
    grantMarketingConsent?: boolean;
    marketingConsentUpdatedOn?: Date;

    constructor(args: any = {}) {
        this.uid =
            typeof args.uid === 'string' || typeof args.id === 'string'
                ? args.uid || args.id
                : null;
        this.displayName =
            typeof args.displayName === 'string'
                ? args.displayName.trim()
                : null;
        this.email =
            typeof args.email === 'string'
                ? args.email.trim().toLowerCase()
                : null;
        this.bio =
            typeof args.bio === 'string'
                ? args.bio.slice(0, 144).trim() // max-length is 144 characters
                : null;
        this.created = isValidDate(args.created)
            ? new Date(args.created)
            : undefined;
        this.updated = isValidDate(new Date(args.updated))
            ? new Date(args.updated)
            : undefined;
        this.teams = args.teams || {};
        this.photoURL =
            typeof args.photoURL === 'string'
                ? args.photoURL
                : getGravatar(args.email);
        this.grantMarketingConsent =
            typeof args.grantMarketingConsent === 'boolean'
                ? args.grantMarketingConsent
                : null;
        this.marketingConsentUpdatedOn = args.marketingConsentUpdatedOn || null;
    }

    static create(args?: Record<string, any>, uid?: string): User {
        const _args = JSON.parse(JSON.stringify(args || {}));
        if (Boolean(uid)) {
            _args.uid = uid;
        }
        return JSON.parse(JSON.stringify(new User(_args)));
    }
}
