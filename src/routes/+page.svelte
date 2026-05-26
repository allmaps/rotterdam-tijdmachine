<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import { onMount } from 'svelte';
	import Nav from '$lib/components/Nav.svelte';
	import data from '$lib/content/data';
	import { SearchService } from '$lib/models/SearchService.svelte';
	import { comparison, flyTo, selectedLocation, mapView, viewState } from '$lib/store.svelte';

	const search = new SearchService();
	let overOpen = $state(false);
	let delenOpen = $state(false);

	if (!comparison.leftAnnotation) comparison.leftAnnotation = data[0]?.annotation ?? '';
	if (!comparison.rightAnnotation) comparison.rightAnnotation = data[1]?.annotation ?? '';

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const lat = params.get('lat');
		const lng = params.get('lng');
		const zoom = params.get('zoom');
		const year = params.get('year');

		if (lat && lng) {
			flyTo.center = [parseFloat(lng), parseFloat(lat)];
			if (zoom) mapView.zoom = parseFloat(zoom);
		}

		if (year) {
			const gevonden = data.find((d) => d.annotation === year);
			if (gevonden) viewState.annotation = gevonden.annotation;
		}
	});
</script>

<div class="flex h-screen flex-col">
	<nav
		class="flex flex-none items-center justify-between bg-green-700 px-4 py-2 text-white"
		style="font-family: 'Barlow Condensed', sans-serif;"
	>
		<div class="flex items-center gap-3">
			<div class="flex items-center space-x-35">
				<div class="flex items-center rounded bg-white px-2 py-1">
					<input
						type="text"
						placeholder="Zoek locatie..."
						class="w-48 bg-transparent text-sm text-gray-800 outline-none"
						bind:value={search.searchTerm}
						oninput={() => search.searchWithDelay()}
					/>

					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 text-gray-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
						/>
					</svg>

					{#if search.results.length > 0}
						<div class="absolute top-12 left-4 z-50 w-72 rounded bg-white shadow-lg">
							{#each search.results as result}
								<button
									class="w-full border-b border-gray-200 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
									onclick={() => {
										const coords = search.selectLocation(result);
										flyTo.center = coords;
										selectedLocation.center = coords;
									}}
								>
									{result.display_name}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<button
					onclick={() => (comparison.active = !comparison.active)}
					class="flex items-center justify-center gap-2 rounded border border-gray-400 px-3 py-1 text-sm font-semibold text-white hover:bg-gray-600 {comparison.active
						? 'bg-gray-600'
						: ''}"
				>
					{comparison.active ? 'Sluiten' : 'Vergelijken'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2h-4M12 3v18"
						/>
					</svg>
				</button>

				<h1 class="text-2xl font-bold" style="font-family: 'Barlow Condensed', sans-serif;">
					Roffa reis door de tijd
				</h1>
				<button onclick={() => (overOpen = true)} class="hover:text-yellow-400">Over</button>
				<button onclick={() => (delenOpen = true)} class="hover:text-yellow-400">Delen</button>
			</div>
		</div>
	</nav>

	<!-- Normale weergave -->
	{#if !comparison.active}
		<div class="flex flex-1 flex-row overflow-hidden">
			<Nav></Nav>
			<div class="relative flex-1 grow">
				<Map />
			</div>
		</div>

		<!-- Vergelijkingsweergave -->
	{:else}
		<div class="flex flex-1 flex-row overflow-hidden">
			<Nav
				onSelect={(ann) => (comparison.leftAnnotation = ann)}
				opacity={comparison.leftOpacity}
				onOpacityChange={(v) => (comparison.leftOpacity = v)}
			/>

			<div class="relative flex-1 border-r-2 border-gray-300">
				<Map annotation={comparison.leftAnnotation} opacity={comparison.leftOpacity} />
			</div>

			<div class="relative flex-1">
				<Map annotation={comparison.rightAnnotation} opacity={comparison.rightOpacity} />
			</div>

			<Nav
				onSelect={(ann) => (comparison.rightAnnotation = ann)}
				opacity={comparison.rightOpacity}
				onOpacityChange={(v) => (comparison.rightOpacity = v)}
			/>
		</div>
	{/if}

	{#if overOpen}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div
				class="relative max-h-[80vh] w-[500px] overflow-y-auto rounded-xl bg-white p-8 shadow-xl"
			>
				<button
					onclick={() => (overOpen = false)}
					class="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700">✕</button
				>
				<h2 class="mb-4 text-center text-2xl font-bold">Over Roffa reis door de tijd</h2>
				<p class="mb-4 leading-relaxed text-gray-700">
					Roffa reis door de tijd maakt het mogelijk om ruim 150 jaar aan Rotterdamse
					stadsgeschiedenis te ontdekken. Vanaf de negentiende eeuw is er veel veranderd in de
					manier waarop Rotterdam zich heeft ontwikkeld als stad en haven.
				</p>
				<p class="mb-4 leading-relaxed text-gray-700">
					De historische kaarten laten zien hoe Rotterdam groeide van een kleine handelsstad tot een
					van de grootste havens ter wereld. Je ziet hoe wijken verschoven, nieuwe gebieden werden
					aangelegd en oude structuren verdwenen.
				</p>
				<p class="leading-relaxed text-gray-700">
					Deze cultuurhistorische tijdreis geeft inzicht in de keuzes die hebben geleid tot het
					Rotterdam van nu, en kan inspireren om historische kennis opnieuw te benutten.
				</p>
			</div>
		</div>
	{/if}

	{#if delenOpen}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="relative w-[500px] rounded-xl bg-white p-8 shadow-xl">
				<button
					onclick={() => (delenOpen = false)}
					class="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700">✕</button
				>
				<h2 class="mb-4 text-center text-2xl font-bold">Deel jouw Roffa reis</h2>
				<p class="mb-6 text-center text-gray-500">Deel het kaartgedeelte dat jij nu bekijkt.</p>
				<div class="mb-6 flex gap-2">
					<input
						type="text"
						readonly
						value={window.location.href}
						class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700"
					/>
					<button
						onclick={() => navigator.clipboard.writeText(window.location.href)}
						class="flex items-center gap-2 rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
					>
						📋 Kopieer
					</button>
				</div>
				<div class="flex justify-center gap-6 text-2xl">
					<a href="mailto:?body={window.location.href}" class="hover:opacity-70">✉️</a>
					<a
						href="https://www.linkedin.com/sharing/share-offsite/?url={window.location.href}"
						target="_blank"
						class="hover:opacity-70">🔗</a
					>
					<a
						href="https://www.reddit.com/submit?url={window.location.href}"
						target="_blank"
						class="hover:opacity-70">👾</a
					>
					<a
						href="https://wa.me/?text={window.location.href}"
						target="_blank"
						class="hover:opacity-70">💬</a
					>
				</div>
			</div>
		</div>
	{/if}
</div>
