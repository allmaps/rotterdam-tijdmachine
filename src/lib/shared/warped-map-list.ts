import { MapCollection } from '$lib/models/MapCollection';
import { WarpedMapList } from '@allmaps/render';
import { parseAnnotation } from '@allmaps/annotation';

import type { WebGL2WarpedMap } from '@allmaps/render/webgl2';

export const mapIdsByAnnotation = new Map<string, Set<string>>();
export const annotationsByMapId = new Map<string, string>();

const collection = new MapCollection();
const annotationUrls = collection.getAllMaps().map((map) => map.metadata.annotation);

// Fetch and parse annotations
const georeferencedMaps = await Promise.all(
	annotationUrls.map(async (url) => {
		try {
			const resp = await fetch(url);
			if (resp.ok) {
				const data = await resp.json();
				const parsedAnnotations = parseAnnotation(data);
				const ids = parsedAnnotations.flatMap(({ id }) => (id ? [id] : []));
				mapIdsByAnnotation.set(url, new Set(ids));
				ids.forEach((ids) => annotationsByMapId.set(ids, url));
				return parsedAnnotations;
			} else {
				console.log('Fetch failed for', url, resp);
				return [];
			}
		} catch {
			console.log('Fetch failed for', url);
			return [];
		}
	})
);

// Function to create a warpedMapList with maps added
export const getWarpedMapList = () => {
	const warpedMapList = new WarpedMapList<WebGL2WarpedMap>();
	warpedMapList.addGeoreferencedMaps(georeferencedMaps.flat());
	return warpedMapList;
};
