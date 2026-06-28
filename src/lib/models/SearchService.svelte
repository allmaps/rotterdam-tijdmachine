<script module lang="ts">
	import type { GeocoderBounds } from '$lib/types';

	const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
	const MIN_SEARCH_LENGTH = 3;
	const SEARCH_DEBOUNCE_MS = 350;
	const MIN_REQUEST_INTERVAL_MS = 1100;
	const CACHE_LIMIT = 100;

	export type SearchResult = {
		place_id: number | string;
		display_name: string;
		lat: string;
		lon: string;
		type?: string;
		class?: string;
	};

	export class SearchService {
		searchTerm = $state('');
		results: SearchResult[] = $state([]);
		loading = $state(false);
		error: string | null = $state(null);
		hasSearched = $state(false);
		bounds: GeocoderBounds | undefined = $state();
		private timer: ReturnType<typeof setTimeout> | null = null;
		private requestId = 0;
		private static cache = new Map<string, SearchResult[]>();
		private static nextRequestAt = 0;
		private static requestQueue = Promise.resolve();

		async search() {
			const normalizedTerm = this.searchTerm.trim();

			if (!normalizedTerm) {
				this.results = [];
				this.loading = false;
				this.error = null;
				this.hasSearched = false;
				return;
			}

			if (normalizedTerm.length < MIN_SEARCH_LENGTH) {
				this.results = [];
				this.loading = false;
				this.error = 'Gebruik minimaal 3 tekens.';
				this.hasSearched = true;
				return;
			}

			if (!this.bounds) {
				this.results = [];
				this.loading = false;
				this.error = 'Zoeken is nog niet klaar.';
				this.hasSearched = true;
				return;
			}

			const cacheKey = this.cacheKey(normalizedTerm);
			const cachedResults = SearchService.cache.get(cacheKey);
			if (cachedResults) {
				this.results = cachedResults;
				this.loading = false;
				this.error = null;
				this.hasSearched = true;
				return;
			}

			const currentRequest = ++this.requestId;
			this.loading = true;
			this.error = null;

			const searchParams = new URLSearchParams({
				format: 'jsonv2',
				q: normalizedTerm,
				limit: '8',
				countrycodes: 'nl',
				viewbox: this.viewboxParam(this.bounds)
			});

			try {
				await SearchService.waitForRequestSlot();

				if (currentRequest !== this.requestId) return;

				const response = await fetch(`${NOMINATIM_ENDPOINT}?${searchParams.toString()}`, {
					headers: {
						Accept: 'application/json'
					}
				});

				if (!response.ok) {
					throw new Error(`Search failed with status ${response.status}`);
				}

				const results = (await response.json()) as SearchResult[];

				if (currentRequest === this.requestId) {
					SearchService.setCachedResults(cacheKey, results);
					this.results = results;
					this.hasSearched = true;
				}
			} catch (error) {
				if (currentRequest === this.requestId) {
					console.error(error);
					this.results = [];
					this.error = 'Zoeken is tijdelijk niet beschikbaar.';
					this.hasSearched = true;
				}
			} finally {
				if (currentRequest === this.requestId) {
					this.loading = false;
				}
			}
		}

		searchWithDelay() {
			if (this.timer) clearTimeout(this.timer);

			if (!this.searchTerm.trim()) {
				this.reset();
				return;
			}

			this.loading = this.searchTerm.trim().length >= MIN_SEARCH_LENGTH && !!this.bounds;
			this.error = null;
			this.hasSearched = false;
			this.timer = setTimeout(() => this.search(), SEARCH_DEBOUNCE_MS);
		}

		reset() {
			if (this.timer) clearTimeout(this.timer);
			this.requestId += 1;
			this.results = [];
			this.loading = false;
			this.error = null;
			this.hasSearched = false;
		}

		selectLocation(result: SearchResult): [number, number] {
			this.reset();
			this.searchTerm = result.display_name;
			return [parseFloat(result.lon), parseFloat(result.lat)];
		}

		private cacheKey(normalizedTerm: string) {
			const bounds = this.bounds;
			const normalizedBounds = bounds
				? [bounds.west, bounds.south, bounds.east, bounds.north]
						.map((value) => value.toFixed(5))
						.join(',')
				: 'no-bounds';

			return `${normalizedTerm.toLocaleLowerCase('nl-NL')}|${normalizedBounds}`;
		}

		private viewboxParam(bounds: GeocoderBounds) {
			return [bounds.west, bounds.north, bounds.east, bounds.south].join(',');
		}

		private static setCachedResults(key: string, results: SearchResult[]) {
			SearchService.cache.set(key, results);

			if (SearchService.cache.size > CACHE_LIMIT) {
				const oldestKey = SearchService.cache.keys().next().value;
				if (oldestKey) SearchService.cache.delete(oldestKey);
			}
		}

		private static async waitForRequestSlot() {
			const previousRequest = SearchService.requestQueue;
			let releaseRequest!: () => void;
			SearchService.requestQueue = new Promise<void>((resolve) => {
				releaseRequest = resolve;
			});

			await previousRequest;

			const wait = Math.max(0, SearchService.nextRequestAt - Date.now());
			if (wait > 0) {
				await new Promise((resolve) => setTimeout(resolve, wait));
			}

			SearchService.nextRequestAt = Date.now() + MIN_REQUEST_INTERVAL_MS;
			releaseRequest();
		}
	}
</script>
