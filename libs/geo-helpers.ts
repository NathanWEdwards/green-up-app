import turfInside from "@turf/boolean-point-in-polygon";
import turfDistance from "@turf/distance";
import * as turf from "@turf/helpers";
import { Feature, Position } from "geojson";

export interface CoordinatesType {
    latitude: number;
    longitude: number;
}

export interface LocationType {
    coordinates?: CoordinatesType;
}

export const isInPolygon = (coordinates: CoordinatesType, polygon: Position[][]): boolean => {
    const point = turf.point([coordinates.longitude, coordinates.latitude]);
    const poly = turf.polygon(polygon);
    return turfInside(point, poly);
};

export const findTownIdByCoordinates = (
    townPolygons: Record<string, { geometry?: { coordinates?: Position[][] } }>,
    coordinates: CoordinatesType
): string | null => {
    if (!coordinates) {
        return null;
    }
    const townId = Object.keys(townPolygons || {}).find(
        (id: string): boolean => {
            const polygon = (townPolygons[id]?.geometry?.coordinates) || [[[]]];
            return isInPolygon(coordinates, polygon);
        }
    );
    return townId || null;
};

export const getClosestSite = (sites: any[], coordinates: CoordinatesType): { distance: number; site: any } => {
    const pnt = turf.point([coordinates.longitude, coordinates.latitude]);
    return (sites || []).reduce(
        (result: { distance: number; site: any }, site: any) => {
            const siteCoords = (site.coordinates || {});
            if (siteCoords.latitude && siteCoords.longitude) {
                const sitePnt = turf.point([siteCoords.longitude, siteCoords.latitude]);
                const distance = turfDistance(pnt, sitePnt);
                if (distance < result.distance) {
                    return { distance, site };
                }
            }
            return result;
        },
        { distance: Infinity, site: sites[0] || {} }
    );
};

export const getTeamGeoJSON = (locations: any[], teamName: string): Feature[] => {
    return (locations || []).map((location: any) => turf.point(
        [location.coordinates.longitude, location.coordinates.latitude],
        { title: teamName }
    ));
};

export const offsetLocations = (staticLocations: Array<LocationType>, locationsToOffset: Array<LocationType>): Array<LocationType> => {
    const isDupe = (staticLocs: Array<LocationType>, loc: any): boolean => Boolean(staticLocs.find(
        (staticLoc: LocationType): boolean => {
            const staticCoordinates: any = staticLoc.coordinates;
            const locCoordinates: any = loc.coordinates;
            return Boolean(
                staticCoordinates.latitude &&
                staticCoordinates.longitude &&
                staticCoordinates.latitude === locCoordinates.latitude &&
                staticCoordinates.longitude === locCoordinates.longitude
            );
        }
    ));

    return locationsToOffset.map((loc: LocationType): LocationType => {
        if (isDupe(staticLocations, loc)) {
            return {
                ...loc,
                coordinates: {
                    latitude: loc.coordinates!.latitude + 0.001,
                    longitude: loc.coordinates!.longitude + 0.001
                }
            };
        }
        return loc;
    });
};


export default { isInPolygon, findTownIdByCoordinates, getClosestSite, getTeamGeoJSON, offsetLocations };