# Rotterdam Tijdmachine

Een interactieve kaartviewer waarmee je historische kaarten van Rotterdam kunt bekijken, vergelijken en verkennen.

## Over het project

De Rotterdam Tijdmachine toont historische kaarten van Rotterdam van 1800 tot 1946. Gebruikers kunnen door de tijd reizen door verschillende kaarten te selecteren en te vergelijken.

## Functies

- **Kaartviewer** — bekijk historische kaarten van Rotterdam op een interactieve kaart
- **Tijdperiode filter** — filter kaarten op tijdperiode (voor 1850, 1850-1900, 1900-1940, na 1940)
- **Favorieten** — sla je favoriete kaarten op en beheer ze
- **Vergelijkingsmodus** — vergelijk twee kaarten naast elkaar
- **Transparantie** — stel de transparantie van de historische kaart in
- **Locatie zoeken** — zoek een locatie op de kaart
- **Kaart downloaden** — download de historische kaart
- **Delen** — deel een kaart via een link

## Technologieën

- [SvelteKit](https://svelte.dev) — frontend framework
- [MapLibre GL](https://maplibre.org) — interactieve kaarten
- [Allmaps](https://allmaps.org) — georeferentie van historische kaarten
- [Tailwind CSS](https://tailwindcss.com) — styling
- [TypeScript](https://www.typescriptlang.org) — taal

## Lokaal ontwikkelen

```bash
# Installeer dependencies
pnpm install

# Start de ontwikkelserver
pnpm run dev

# Bouw de site
pnpm run build
```

## Kaartcollectie

| Jaar | Kaart | Instelling |
|------|-------|------------|
| 1800 | Nieuwe platte grond der stad Rotterdam | Universiteitsbibliotheek Utrecht |
| 1832 | Kadastrale kaart 1811-1832 | Rijksdienst voor Cultureel Erfgoed |
| 1897 | Plattegrond van Rotterdam in 10 bladen | Stadsarchief Rotterdam |
| 1940 | Kaart van het centrum van Rotterdam voor mei 1940 | Stadsarchief Rotterdam |
| 1946 | Basisplan en Bestemmingen binnenstad Rotterdam | Nationaal Archief |

## Live site

[rotterdam-tijdmachine](https://allmaps.github.io/rotterdam-tijdmachine/)
