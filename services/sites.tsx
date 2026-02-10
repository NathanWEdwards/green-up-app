import { collection } from '@react-native-firebase/firestore';

import { SiteArgs } from '@/models/Site';
import { callableNearbySites, db } from '@/services/firebase';
import { getCurrentPosition } from '@/services/location';



export const getAllSites = async () => {
  try {
    
    const siteSnapshot = await collection(
      db,
      process.env.SITES_COLLECTION_NAME || 'sites'
    ).get();
    const sites: SiteArgs[] = [];
    siteSnapshot.forEach((doc: any) => {
      sites.push(doc.data());
    });
    return sites;
  } catch (error) {
    throw error;
  }
}

export const nearestSites = async (): Promise<{label: string; value: string; latitude: number; longitude: number}[]> => {
    let output: {label: string; value: string, latitude: number, longitude: number}[] = [];
    try {
      const location = await getCurrentPosition();
      if (!location) {
        return [];
      }
      let response: any[] = (await callableNearbySites({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
      })).data as any[];

      response.forEach(site => {
          output.push({
              label: site.name,
              value: site.id,
              latitude: site.latitude,
              longitude: site.longitude,
          });
      });
      return output;
    } catch (error) {
    }
    return [];
}