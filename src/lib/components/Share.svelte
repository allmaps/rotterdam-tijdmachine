<script lang="ts">
	import { page } from '$app/state';
	import Modal from '$lib/components/Modal.svelte';
	import { Check, Copy, X, Share2 } from '@lucide/svelte';
	import { tick } from 'svelte';

	let { onClose }: { onClose: () => void } = $props();

	let url = $derived(page.url.href);
	let copied = $state(false);
	let inputElement: HTMLInputElement | undefined = $state();
	let copiedTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		tick().then(() => {
			inputElement?.focus();
			inputElement?.select();
		});
	});

	async function copyUrl() {
		try {
			await navigator.clipboard.writeText(url);
		} catch {
			inputElement?.select();
			document.execCommand('copy');
		}

		if (copiedTimer) clearTimeout(copiedTimer);
		copied = true;
		copiedTimer = setTimeout(() => (copied = false), 2000);
	}
</script>

<Modal {onClose} ariaLabelledby="share-title">
	<div class="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
		<Share2 class="h-5 w-5 flex-none text-green-700" />
		<h2 id="share-title" class="text-xl leading-none font-bold md:text-2xl">Deel jouw tijdreis</h2>
		<button
			type="button"
			onclick={onClose}
			aria-label="Sluit delen"
			class="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
		>
			<X class="h-5 w-5" />
		</button>
	</div>

	<div class="px-5 py-5">
		<p class="mb-4 text-gray-500">Deel het kaartgedeelte dat jij nu bekijkt.</p>
		<div class="flex flex-col gap-2 sm:flex-row">
			<input
				bind:this={inputElement}
				type="text"
				readonly
				value={url}
				class="m-0 min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-700"
			/>
			<button
				type="button"
				onclick={copyUrl}
				class="flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-semibold text-white transition-colors {copied
					? 'bg-green-600'
					: 'bg-gray-800 hover:bg-gray-700'}"
			>
				{#if copied}
					<Check class="h-4 w-4" />
					Gekopieerd
				{:else}
					<Copy class="h-4 w-4" />
					Kopieer
				{/if}
			</button>
		</div>
	</div>
</Modal>
