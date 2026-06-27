<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import MapInfo from '$lib/components/MapInfo.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import type { MapLocation } from '$lib/types';

	let {
		annotation = $bindable(''),
		opacity = $bindable(100),
		selectedYear = $bindable(),
		currentLocation = $bindable({
			center: [4.4777, 51.9244] as [number, number],
			zoom: 12
		}),
		navPosition = 'left',
		panelId = `map-info-panel-${navPosition}`,
		bordered = false,
		showMapYearTicks = false,
		syncUrl = false,
		enableFlyTo = false,
		enableLocationMarker = false,
		enableKeyboardToggle = false
	}: {
		annotation?: string;
		opacity?: number;
		selectedYear: number;
		currentLocation?: MapLocation;
		navPosition?: 'left' | 'right';
		panelId?: string;
		bordered?: boolean;
		showMapYearTicks?: boolean;
		syncUrl?: boolean;
		enableFlyTo?: boolean;
		enableLocationMarker?: boolean;
		enableKeyboardToggle?: boolean;
	} = $props();

	let mapOrderClass = $derived(navPosition === 'right' ? 'md:order-1' : 'md:order-2');
	let controlsPosition: 'top-left' | 'top-right' = $derived(
		navPosition === 'right' ? 'top-left' : 'top-right'
	);
</script>

<section
	class="map-pane relative flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden {bordered
		? 'md:border-r-2 md:border-gray-300'
		: ''}"
>
	<div class="absolute inset-y-0 z-20 flex-none {navPosition === 'right' ? 'right-0' : 'left-0'}">
		<Slider bind:selectedYear {navPosition} {showMapYearTicks} />
	</div>

	<div class="relative flex-1 grow {mapOrderClass}">
		<Map
			bind:annotation
			bind:opacity
			bind:currentLocation
			{syncUrl}
			{enableFlyTo}
			{enableLocationMarker}
			{enableKeyboardToggle}
			{controlsPosition}
		/>
		<MapInfo bind:annotation bind:selectedYear {panelId} />
	</div>
</section>

<style>
	.map-pane {
		container: map-pane / inline-size;
	}
</style>
