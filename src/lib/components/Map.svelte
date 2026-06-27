<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import maplibregl from 'maplibre-gl';
	import { WarpedMapLayer } from '@allmaps/maplibre';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import {
		viewState,
		flyTo,
		selectedLocation,
		mapView,
		loadedAnnotations
	} from '$lib/store.svelte';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getProtomapsLayers, getProtomapsStyle } from '$lib/basemap';
	import { MapCollection } from '$lib/models/MapCollection';
	import MapControls from '$lib/components/MapControls.svelte';
	import type { MapLocation } from '$lib/types';

	let {
		annotation = $bindable(viewState.annotation),
		opacity = $bindable(viewState.opacity),
		currentLocation = $bindable({
			center: [...mapView.center] as [number, number],
			zoom: mapView.zoom
		}),
		syncUrl = false,
		enableFlyTo = false,
		enableLocationMarker = false,
		enableKeyboardToggle = false,
		controlsPosition = 'top-right'
	}: {
		annotation?: string;
		opacity?: number;
		currentLocation?: MapLocation;
		syncUrl?: boolean;
		enableFlyTo?: boolean;
		enableLocationMarker?: boolean;
		enableKeyboardToggle?: boolean;
		controlsPosition?: 'top-left' | 'top-right';
	} = $props();

	let actieveAnnotation = $derived(annotation);
	let actieveOpacity = $derived((opacity ?? 100) / 100);

	let mapElement: HTMLDivElement;
	let map = $state<maplibregl.Map>();
	let mapReady: boolean = $state(false);
	let loaded: boolean = $state(false);
	let routerReady = false;
	let isSyncing = false;
	let warpedMapLayer = new WarpedMapLayer({ visible: false });

	const collection = new MapCollection();
	const allMaps = collection.getAllMaps();
	const mapIdsByAnnotation = new SvelteMap<string, Set<string>>();
	const basemapStyle = getProtomapsStyle('light');
	const basemapLayers = getProtomapsLayers('light', undefined, {});
	const loadedStyleImages = new Set<string>();
	let canZoomToActiveMap = $derived(
		loaded && !!actieveAnnotation && (mapIdsByAnnotation.get(actieveAnnotation)?.size ?? 0) > 0
	);

	afterNavigate(() => {
		routerReady = true;
	});

	// Laad de kaartlaag als de annotatie verandert
	$effect(() => {
		if (loaded && actieveAnnotation && mapIdsByAnnotation.size > 0) {
			const idsToShow = mapIdsByAnnotation.get(actieveAnnotation) ?? new Set();
			warpedMapLayer.setMapsOptions((id: string) =>
				idsToShow.has(id) ? { visible: true } : { visible: false }
			);
		}
	});

	// Pas transparantie aan
	$effect(() => {
		if (loaded) {
			warpedMapLayer.setOpacity(actieveOpacity);
		}
	});

	// Vlieg naar locatie
	$effect(() => {
		if (enableFlyTo && mapReady && map && flyTo.center) {
			map.flyTo({ center: flyTo.center, zoom: 14 });
		}
	});

	// Tijdelijke marker
	$effect(() => {
		if (enableLocationMarker && mapReady && map && selectedLocation.center) {
			const marker = new maplibregl.Marker().setLngLat(selectedLocation.center).addTo(map);
			setTimeout(() => {
				marker.remove();
				selectedLocation.center = null;
			}, 3000);
		}
	});

	// Synchroniseer kaartpositie met de gebonden locatie.
	$effect(() => {
		if (mapReady && map && currentLocation) {
			const center = currentLocation.center;
			const zoom = currentLocation.zoom;
			if (!mapMatchesLocation(center, zoom)) {
				isSyncing = true;
				map.jumpTo({ center, zoom });
				isSyncing = false;
			}
		}
	});

	function mapMatchesLocation(center: [number, number], zoom: number) {
		if (!map) return false;
		const c = map.getCenter();
		return (
			Math.abs(c.lng - center[0]) < 0.000001 &&
			Math.abs(c.lat - center[1]) < 0.000001 &&
			Math.abs(map.getZoom() - zoom) < 0.000001
		);
	}

	function updateBrowserUrl() {
		if (!routerReady || !map) return;

		const center = map.getCenter();
		const params = new URLSearchParams({
			lat: center.lat.toFixed(5),
			lng: center.lng.toFixed(5),
			zoom: map.getZoom().toFixed(2),
			year: String(annotation)
		});
		replaceState(resolve(`/?${params.toString()}`), {});
	}

	function isImageUrl(id: string) {
		return /^https?:\/\//.test(id) || id.startsWith('/') || id.startsWith('data:');
	}

	function zoomToActiveMap() {
		if (!map || !actieveAnnotation) return;

		const ids = mapIdsByAnnotation.get(actieveAnnotation);
		if (!ids) return;

		const bounds = warpedMapLayer.getMapsBounds([...ids]);
		if (bounds) {
			map.fitBounds(bounds, { padding: 40 });
		}
	}

	onMount(() => {
		const mapInstance = new maplibregl.Map({
			style: basemapStyle,
			container: mapElement,
			attributionControl: false,
			maxPitch: 0,
			center: currentLocation.center,
			zoom: currentLocation.zoom
		});
		map = mapInstance;
		mapReady = true;

		mapInstance.on('move', () => {
			if (!isSyncing) {
				currentLocation = {
					center: mapInstance.getCenter().toArray() as [number, number],
					zoom: mapInstance.getZoom()
				};
			}
		});

		mapInstance.on('moveend', () => {
			const center = mapInstance.getCenter();
			console.log('Kaart gestopt op:', center.lng, center.lat, 'zoom:', mapInstance.getZoom());

			if (syncUrl) {
				updateBrowserUrl();
			}
		});

		mapInstance.on('load', async () => {
			basemapLayers.forEach((layer) => mapInstance.addLayer(layer, 'foreground'));
			mapInstance.addLayer(warpedMapLayer);
			await Promise.all(
				allMaps.map(async (mapCard) => {
					const annotationUrl = mapCard.metadata.annotation;
					try {
						const ids = await warpedMapLayer.addGeoreferenceAnnotationByUrl(annotationUrl);
						const stringIds = ids.filter((id): id is string => typeof id === 'string');
						if (stringIds.length > 0) {
							mapIdsByAnnotation.set(annotationUrl, new Set(stringIds));
							loadedAnnotations.add(annotationUrl);
						}
					} catch {
						console.warn('Kon annotatie niet laden:', annotationUrl);
					}
				})
			);
			loaded = true;
		});

		mapInstance.on('styleimagemissing', async (event) => {
			if (loadedStyleImages.has(event.id)) return;
			if (!isImageUrl(event.id)) return;

			loadedStyleImages.add(event.id);
			try {
				const image = await mapInstance.loadImage(event.id);
				if (!mapInstance.hasImage(event.id)) {
					mapInstance.addImage(event.id, image.data);
				}
			} catch {
				loadedStyleImages.delete(event.id);
			}
		});

		return () => {
			mapInstance.remove();
			map = undefined;
			mapReady = false;
		};
	});

	let previousOpacity: number | undefined;
	function toggleMap(event: KeyboardEvent) {
		if (!enableKeyboardToggle || event.repeat) return;
		if (event.code === 'Space') {
			if (previousOpacity === undefined) {
				previousOpacity = opacity;
				opacity = 0;
			} else {
				opacity = previousOpacity;
				previousOpacity = undefined;
			}
		}
	}
</script>

<svelte:window on:keydown={toggleMap} on:keyup={toggleMap} />

<div bind:this={mapElement} class="absolute inset-0 h-full w-full"></div>
{#if mapReady && map}
	<MapControls
		{map}
		bind:opacity
		position={controlsPosition}
		canZoomToMap={canZoomToActiveMap}
		onZoomToMap={zoomToActiveMap}
	/>
{/if}
