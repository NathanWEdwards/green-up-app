import { serify, defaultOptions } from '@karmaniverous/serify-deserify';
import { instanceToPlain } from 'class-transformer';

/**
 * Sanitizes a map-like object for addition to Redux stores.
 * @param value The object to sanitize.
 * @returns The sanitized object.
 */
export function sanitize(value: any) {
    const serializable: any = {};
    Object.keys(value).forEach((key: string) => {
        const obj = instanceToPlain(value[key]);
        serializable[key] = serify(obj, defaultOptions);
    });
    return serializable;
}
