export type MapMetadata = {
	label: string;
	title: string;
	year: number;
	institution: string;
	url: string;
	iiif?: {
		url: string;
		type: string;
	};
	annotation: string;
};

export type MapLocation = {
	center: [number, number];
	zoom: number;
	bearing: number;
};

export type GeocoderBounds = {
	west: number;
	south: number;
	east: number;
	north: number;
};

export type MapKeyboardCommand = {
	id: number;
	offset?: [number, number];
	zoomDelta?: number;
	bearingDelta?: number;
};

export type MapToolbarCommand = {
	id: number;
	action: 'toggle-in-view' | 'toggle-rotation' | 'toggle-focus';
};
