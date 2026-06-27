import { MapCollection } from '$lib/models/MapCollection';

import { WarpedMapList } from '@allmaps/render';
import type { WebGL2WarpedMap } from '@allmaps/render/webgl2';
import { parseAnnotation } from '@allmaps/annotation';

export const mapIdsByAnnotation = new Map<string, Set<string>>();
export const annotationsByMapId = new Map<string, string>();

const collection = new MapCollection();
const annotationUrls = collection.getAllMaps().map((map) => map.metadata.annotation);

const fetchJson = (url: string) => fetch(url).then((resp) => resp.json());

const georeferencedMaps = await Promise.all(
	annotationUrls.map((url) =>
		fetchJson(url).then((data) => {
			const parsedAnnotations = parseAnnotation(data);
			const ids = parsedAnnotations.flatMap(({ id }) => (id ? [id] : []));
			mapIdsByAnnotation.set(url, new Set(ids));
			ids.forEach((ids) => annotationsByMapId.set(ids, url));
			return parsedAnnotations;
		})
	)
);

export const getWarpedMapList = () => {
	const warpedMapList = new WarpedMapList<WebGL2WarpedMap>();
	warpedMapList.addGeoreferencedMaps(georeferencedMaps.flat());
	return warpedMapList;
};
