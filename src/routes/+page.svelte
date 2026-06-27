<script lang="ts">
	import MapPane from '$lib/components/MapPane.svelte';
	import Header from '$lib/components/Header.svelte';
	import About from '$lib/components/About.svelte';
	import Share from '$lib/components/Share.svelte';
	import { onMount } from 'svelte';
	import data from '$lib/content/data';
	import { comparison, mapView, viewState } from '$lib/store.svelte';
	import type { MapLocation } from '$lib/types';

	let overOpen = $state(false);
	let shareOpen = $state(false);
	let currentLocation = $state<MapLocation>({
		center: [...mapView.center] as [number, number],
		zoom: mapView.zoom,
		bearing: mapView.bearing
	});
	let compareStacked = $state(false);

	if (!viewState.annotation) viewState.annotation = data[0]?.annotation ?? '';
	if (!comparison.rightAnnotation) comparison.rightAnnotation = data[1]?.annotation ?? '';
	let selectedYear = $state(yearForAnnotation(viewState.annotation) ?? data[0]?.year ?? 1900);
	let rightSelectedYear = $state(
		yearForAnnotation(comparison.rightAnnotation) ?? data[1]?.year ?? data[0]?.year ?? 1900
	);
	let leftNavPosition: 'left' | 'right' = $derived(
		comparison.active && compareStacked ? 'right' : 'left'
	);

	$effect(() => {
		mapView.center = currentLocation.center;
		mapView.zoom = currentLocation.zoom;
		mapView.bearing = currentLocation.bearing;
	});

	function yearForAnnotation(annotation: string) {
		return data.find((map) => map.annotation === annotation)?.year;
	}

	onMount(() => {
		const compareStackQuery = window.matchMedia('(max-width: 767px)');
		const params = new URLSearchParams(window.location.search);
		const lat = params.get('lat');
		const lng = params.get('lng');
		const zoom = params.get('zoom');
		const bearing = params.get('bearing');
		const year = params.get('year');

		function syncCompareStacked(event: MediaQueryList | MediaQueryListEvent) {
			compareStacked = event.matches;
		}

		syncCompareStacked(compareStackQuery);
		compareStackQuery.addEventListener('change', syncCompareStacked);

		if (lat && lng) {
			currentLocation = {
				center: [parseFloat(lng), parseFloat(lat)],
				zoom: zoom ? parseFloat(zoom) : currentLocation.zoom,
				bearing: bearing ? parseFloat(bearing) : currentLocation.bearing
			};
		}

		if (year) {
			const gevonden = data.find((d) => d.annotation === year);
			if (gevonden) {
				selectedYear = gevonden.year;
				viewState.annotation = gevonden.annotation;
			}
		}

		return () => {
			compareStackQuery.removeEventListener('change', syncCompareStacked);
		};
	});
</script>

<div class="flex h-screen flex-col">
	<Header onOverOpen={() => (overOpen = true)} onShareOpen={() => (shareOpen = true)} />

	<div
		class="flex flex-1 {comparison.active
			? 'flex-col overflow-y-auto md:flex-row md:overflow-hidden'
			: 'overflow-hidden'}"
	>
		<MapPane
			navPosition={leftNavPosition}
			paneSide="left"
			layersId="map-layers-left"
			bordered={comparison.active}
			bind:annotation={viewState.annotation}
			bind:opacity={viewState.opacity}
			bind:selectedYear
			bind:currentLocation
			syncUrl
			enableFlyTo
			enableLocationMarker
			enableKeyboardToggle
			enableLayersShortcut
			showLayersPaneIndicator={comparison.active}
		/>

		{#if comparison.active}
			<MapPane
				navPosition="right"
				paneSide="right"
				layersId="map-layers-right"
				bind:annotation={comparison.rightAnnotation}
				bind:opacity={comparison.rightOpacity}
				bind:selectedYear={rightSelectedYear}
				bind:currentLocation
				showLayersPaneIndicator
			/>
		{/if}
	</div>

	{#if overOpen}
		<About onClose={() => (overOpen = false)} />
	{/if}

	{#if shareOpen}
		<Share onClose={() => (shareOpen = false)} />
	{/if}
</div>
