<script lang="ts">
    import { MapCollection } from '$lib/models/MapCollection';
    import { viewState, zoomTo } from '$lib/store.svelte';

    const collection = new MapCollection();
    const maps = collection.getAllMaps();

    let activeMap = $derived(maps.find((m) => m.metadata.annotation === viewState.annotation));
</script>

{#if activeMap}
    <div
        class="absolute right-4 bottom-8 z-10 w-64 rounded-lg bg-white shadow-lg p-3"
        style="font-family: 'Barlow Condensed', sans-serif;"
    >
        <p class="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Kaartinfo</p>
        <dl class="flex flex-col gap-1 text-xs text-gray-700 mb-3">
            <div class="flex justify-between border-b border-gray-100 py-1">
                <dt class="text-gray-500">Jaar</dt>
                <dd class="font-semibold">{activeMap.metadata.year}</dd>
            </div>
            <div class="flex justify-between border-b border-gray-100 py-1">
                <dt class="text-gray-500">Bron</dt>
                <dd class="text-right font-semibold">{activeMap.metadata.institution}</dd>
            </div>
            <div class="flex justify-between border-b border-gray-100 py-1">
                <dt class="text-gray-500">Formaat</dt>
                <dd class="font-semibold">{activeMap.metadata.iiif ? 'IIIF / GeoRef' : 'GeoRef'}</dd>
            </div>
        </dl>
        <a
            href={activeMap.metadata.iiif?.type === 'image'
                ? activeMap.metadata.iiif.url.replace('/info.json', '') + '/full/full/0/default.jpg'
                : activeMap.metadata.url}
            target="_blank"
            download
            class="mb-2 flex w-full items-center justify-center gap-2 rounded border border-green-700 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50"
        >
            Download kaart
        </a>
        <button
            onclick={() => (zoomTo.annotation = activeMap?.metadata.annotation ?? null)}
            class="flex w-full items-center justify-center gap-2 rounded bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800"
        >
            Zoom naar kaart
        </button>
    </div>
{/if}
