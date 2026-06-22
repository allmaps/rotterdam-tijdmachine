<script lang="ts">
	import { comparison, flyTo, selectedLocation } from '$lib/store.svelte';
	import { SearchService } from '$lib/models/SearchService.svelte';
	import { Columns2 } from '@lucide/svelte';

	let { onOverOpen, onShareOpen, onMenuToggle }: { onOverOpen: () => void; onShareOpen: () => void; onMenuToggle: () => void } = $props();

	const search = new SearchService();
</script>

<nav
    class="flex flex-none items-center justify-between bg-green-700 pl-4 pr-30 py-2 text-white"
    style="font-family: 'Barlow Condensed', sans-serif;"
>
    <button onclick={onMenuToggle} aria-label="Menu" class="flex flex-col gap-1 md:hidden">
        <span class="block h-0.5 w-5 bg-white"></span>
        <span class="block h-0.5 w-5 bg-white"></span>
        <span class="block h-0.5 w-5 bg-white"></span>
    </button>

    <div class="relative flex items-center rounded bg-white px-2 py-1">
        <input
            type="text"
            placeholder="Zoek locatie..."
            class="w-28 bg-transparent text-sm text-gray-800 outline-none md:w-48"
            bind:value={search.searchTerm}
            oninput={() => search.searchWithDelay()}
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        {#if search.results.length > 0}
            <div class="absolute top-10 left-0 z-50 w-72 rounded bg-white shadow-lg">
                {#each search.results as result}
                    <button
                        class="w-full border-b border-gray-200 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                        onclick={() => { flyTo.center = search.selectLocation(result); selectedLocation.center = flyTo.center; }}
                    >
                        {result.display_name}
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <button
        onclick={() => (comparison.active = !comparison.active)}
        class="hidden md:flex items-center gap-2 rounded border border-white/40 px-3 py-1 text-sm font-semibold hover:bg-green-800 {comparison.active ? 'bg-green-800' : ''}"
    >
        <Columns2 class="h-4 w-4" />
        {comparison.active ? 'Sluiten' : 'Vergelijken'}
    </button>

    <h1 class="text-2xl font-bold">Rotterdam Tijdmachine</h1>

    <button onclick={onOverOpen} class="hidden bg-transparent text-white md:block hover:text-yellow-400">Over</button>
    <button onclick={onShareOpen} class="hidden bg-transparent text-white md:block hover:text-yellow-400">Delen</button>
</nav>
