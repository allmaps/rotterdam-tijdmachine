<script lang="ts">
	import { Compass, LocateFixed, Minus, Plus, SlidersHorizontal } from '@lucide/svelte';
	import type maplibregl from 'maplibre-gl';

	type ControlPosition = 'top-left' | 'top-right';

	let {
		map,
		opacity = $bindable(100),
		position = 'top-right',
		canZoomToMap = false,
		onZoomToMap = () => {}
	}: {
		map: maplibregl.Map;
		opacity?: number;
		position?: ControlPosition;
		canZoomToMap?: boolean;
		onZoomToMap?: () => void;
	} = $props();

	const positionClass = $derived(position === 'top-left' ? 'top-2 left-2' : 'top-2 right-2');
	const opacityPanelClass = $derived(position === 'top-left' ? 'left-0' : 'right-0');
	let opacityOpen = $state(false);

	const controls = [
		{
			label: 'Inzoomen',
			icon: Plus,
			action: () => map.zoomIn({ duration: 250 })
		},
		{
			label: 'Uitzoomen',
			icon: Minus,
			action: () => map.zoomOut({ duration: 250 })
		},
		{
			label: 'Noord boven',
			icon: Compass,
			action: () => map.easeTo({ bearing: 0, pitch: 0, duration: 250 })
		},
		{
			label: 'Zoom naar kaartlaag',
			icon: LocateFixed,
			disabled: () => !canZoomToMap,
			action: () => onZoomToMap()
		}
	];

	function handleOpacity(event: Event) {
		opacity = Number((event.target as HTMLInputElement).value);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			opacityOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="absolute z-30 {positionClass}"
	role="group"
	aria-label="Kaartnavigatie"
	onpointerdown={(event) => event.stopPropagation()}
	ondblclick={(event) => event.stopPropagation()}
>
	<div
		class="flex overflow-hidden rounded-md border border-gray-200 bg-white text-gray-800 shadow-lg"
	>
		{#each controls as control}
			{@const Icon = control.icon}
			<button
				type="button"
				aria-label={control.label}
				title={control.label}
				disabled={control.disabled?.() ?? false}
				onclick={control.action}
				class="flex h-9 w-9 items-center justify-center border-r border-gray-200 last:border-r-0 hover:bg-gray-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
			>
				<Icon class="h-4 w-4" />
			</button>
		{/each}

		<button
			type="button"
			aria-label="Transparantie aanpassen"
			title="Transparantie aanpassen"
			aria-expanded={opacityOpen}
			onclick={() => (opacityOpen = !opacityOpen)}
			class="flex h-9 w-9 items-center justify-center border-r border-gray-200 last:border-r-0 hover:bg-gray-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green-700 {opacityOpen
				? 'bg-gray-100'
				: ''}"
		>
			<SlidersHorizontal class="h-4 w-4" />
		</button>
	</div>

	{#if opacityOpen}
		<div
			class="absolute top-11 {opacityPanelClass} w-56 rounded-md border border-gray-200 bg-white p-3 text-gray-800 shadow-lg"
		>
			<div class="mb-2 flex items-center justify-between gap-3">
				<span class="text-xs font-semibold">Transparantie</span>
				<span class="font-heading text-xs">{opacity}%</span>
			</div>
			<input
				value={opacity}
				oninput={handleOpacity}
				type="range"
				min="0"
				max="100"
				class="m-0 w-full accent-green-700"
				aria-label="Transparantie kaartlaag"
			/>
			<div class="mt-1 flex justify-between text-[0.65rem] font-semibold text-gray-400">
				<span>0%</span>
				<span>100%</span>
			</div>
		</div>
	{/if}
</div>
