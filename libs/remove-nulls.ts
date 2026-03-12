// removes keys with null values
export function removeNulls(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj)
        .filter((key: string): boolean => obj[key] !== null)
        .reduce((newObj: Record<string, any>, key: string): Record<string, any> => ({ ...newObj, [key]: obj[key] }), {});
}