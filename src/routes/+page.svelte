<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let mapEl: HTMLDivElement;
	let map: any;

	const mapView = { center: [4.47917, 51.92528], zoom: 11 };

	// helper: controleer of een URL JSON/style teruggeeft
	async function styleIsJson(url: string) {
		try {
			const res = await fetch(url, { method: 'GET', mode: 'cors' });
			if (!res.ok) return false;
			const ct = res.headers.get('content-type') || '';
			if (ct.includes('application/json')) return true;
			const text = await res.text();
			JSON.parse(text);
			return true;
		} catch (e) {
			return false;
		}
	}

	onMount(async () => {
		const maplibregl = (await import('maplibre-gl')).default;
		const styleUrl = 'https://tiles.openfreemap.org/styles/liberty';
		const fallbackStyle = 'https://demotiles.maplibre.org/style.json';

		const styleOk = await styleIsJson(styleUrl);
		const useStyle = styleOk ? styleUrl : fallbackStyle;

		// If useStyle is a JSON style URL we can pass it directly. If both fail,
		// we create a minimal empty style and add raster tiles (OSM) as fallback.
		let createdWithEmptyStyle = false;

		const tryCreateMap = (style: any) => {
			map = new maplibregl.Map({
				container: mapEl,
				style,
				center: mapView.center,
				zoom: mapView.zoom,
				maxPitch: 0
			});
		};

		try {
			if (useStyle) {
				tryCreateMap(useStyle);
			} else {
				// no usable style URL: create minimal style and add raster tiles later
				const minimalStyle = { version: 8, sources: {}, layers: [] };
				createdWithEmptyStyle = true;
				tryCreateMap(minimalStyle);
			}

			map.addControl(new maplibregl.NavigationControl(), 'top-right');

			map.on('load', () => {
				// if we created an empty style, add raster OSM tiles as fallback
				if (createdWithEmptyStyle) {
					map.addSource('osm-tiles', {
						type: 'raster',
						tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
						tileSize: 256
					});
					map.addLayer({ id: 'osm-layer', type: 'raster', source: 'osm-tiles' });
				}
				map.resize();
			});
		} catch (err) {
			// Final fallback: create map with demotiles style (if not already used)
			if (!createdWithEmptyStyle) {
				tryCreateMap(fallbackStyle);
				map.on('load', () => map.resize());
			} else {
				console.error('MapLibre init failed', err);
			}
		}
	});

	onDestroy(() => {
		map?.remove();
	});
</script>

<header>
	<h1>Rotterdam Tijdmachine</h1>
</header>
<div id="map" bind:this={mapEl}></div>

<style>
	:global(body) {
		margin: 0;
	}

	header {
		height: 64px; /* pas aan indien je een andere header height wilt */
		display: flex;
		align-items: center;
		padding: 0 1rem;
		background: #fff;
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
		z-index: 10;
	}

	#map {
		width: 100%;
		height: calc(100vh - 64px); /* kaart vult nu het scherm minus header */
		min-height: 300px;
	}
</style>
