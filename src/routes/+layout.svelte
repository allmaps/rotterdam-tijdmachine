<script lang="ts">
	import './layout.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const siteName = 'Rotterdam Tijdmachine';
	const siteUrl = 'https://pages.allmaps.org/rotterdam-tijdmachine/';
	const description =
		'Verken historische kaarten van Rotterdam door de tijd en vergelijk kaartlagen met de huidige stad.';
</script>

<svelte:head>
	<title>{siteName}</title>
	<meta name="description" content={description} />
	<meta name="application-name" content={siteName} />
	<meta name="apple-mobile-web-app-title" content={siteName} />
	<meta name="theme-color" content="#15803d" />
	<meta name="color-scheme" content="light" />
	<meta name="robots" content="index, follow" />
	<meta name="format-detection" content="telephone=no" />

	<meta property="og:type" content="website" />
	<meta property="og:locale" content="nl_NL" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={siteName} />
	<meta property="og:description" content={description} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={siteName} />
	<meta name="twitter:description" content={description} />

	<link rel="canonical" href={siteUrl} />
	<link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
