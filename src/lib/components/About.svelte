<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { X } from '@lucide/svelte';
	import { tick } from 'svelte';

	let { onClose }: { onClose: () => void } = $props();

	let closeButton: HTMLButtonElement | undefined = $state();

	$effect(() => {
		tick().then(() => {
			closeButton?.focus();
		});
	});
</script>

<Modal {onClose} ariaLabelledby="about-title" panelClass="max-h-[calc(100vh-7rem)]">
	<div class="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
		<h2 id="about-title" class="text-xl leading-none font-bold md:text-2xl">
			Over Roffa reis door de tijd
		</h2>
		<button
			bind:this={closeButton}
			type="button"
			onclick={onClose}
			aria-label="Sluit over"
			class="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
		>
			<X class="h-5 w-5" />
		</button>
	</div>

	<div class="overflow-y-auto px-5 py-5">
		<p class="mb-4 leading-relaxed text-gray-700">
			Roffa reis door de tijd maakt het mogelijk om ruim 150 jaar aan Rotterdamse stadsgeschiedenis
			te ontdekken. Vanaf de negentiende eeuw is er veel veranderd in de manier waarop Rotterdam
			zich heeft ontwikkeld als stad en haven.
		</p>
		<p class="mb-4 leading-relaxed text-gray-700">
			De historische kaarten laten zien hoe Rotterdam groeide van een kleine handelsstad tot een van
			de grootste havens ter wereld. Je ziet hoe wijken verschoven, nieuwe gebieden werden aangelegd
			en oude structuren verdwenen.
		</p>
		<p class="leading-relaxed text-gray-700">
			Deze cultuurhistorische tijdreis geeft inzicht in de keuzes die hebben geleid tot het
			Rotterdam van nu, en kan inspireren om historische kennis opnieuw te benutten.
		</p>
	</div>
</Modal>
