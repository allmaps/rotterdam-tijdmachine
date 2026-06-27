<script module lang="ts">
	function readFavorites() {
		if (typeof localStorage === 'undefined') return [];

		try {
			const parsed = JSON.parse(localStorage.getItem('favorites') ?? '[]');
			return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
		} catch {
			return [];
		}
	}

	function saveFavorites() {
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem('favorites', JSON.stringify(favorites));
			} catch {
				// Favorieten blijven in deze sessie beschikbaar als opslag niet lukt.
			}
		}
	}

	export const favorites = $state<string[]>(readFavorites());

	export function toggleFavorite(annotation: string) {
		const index = favorites.indexOf(annotation);
		if (index === -1) {
			favorites.push(annotation);
		} else {
			favorites.splice(index, 1);
		}
		saveFavorites();
	}

	export const viewState = $state({ annotation: '', opacity: 100 });

	export const flyTo = $state<{ center: [number, number] | null }>({ center: null });

	export const selectedLocation = $state<{ center: [number, number] | null }>({ center: null });

	export const mapView = $state({
		center: [4.4777, 51.9244] as [number, number],
		zoom: 12,
		bearing: 0
	});

	export const comparison = $state({
		active: false,
		leftAnnotation: '',
		rightAnnotation: '',
		leftOpacity: 100,
		rightOpacity: 100
	});

	export const loadedAnnotations = $state(new Set<string>());
</script>
