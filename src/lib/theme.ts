import colors from 'tailwindcss/colors';

const themeShades = [
	'50',
	'100',
	'200',
	'300',
	'400',
	'500',
	'600',
	'700',
	'800',
	'900',
	'950'
] as const;

type ThemeShade = (typeof themeShades)[number];
type ThemePalette = Record<ThemeShade, string>;

function isThemePalette(value: unknown): value is ThemePalette {
	if (!value || typeof value !== 'object') return false;

	return themeShades.every(
		(shade) => typeof (value as Record<string, unknown>)[shade] === 'string'
	);
}

function normalizeColorName(color: string | undefined) {
	return color?.trim().toLowerCase() || 'green';
}

export function getThemePalette(color: string | undefined) {
	const palette = (colors as Record<string, unknown>)[normalizeColorName(color)];
	return isThemePalette(palette) ? palette : (colors.green as ThemePalette);
}

export function getThemeStyle(color: string | undefined) {
	const palette = getThemePalette(color);

	return themeShades.map((shade) => `--color-brand-${shade}: ${palette[shade]};`).join(' ');
}

export function getThemeMetaColor(color: string | undefined) {
	return toHexColor(getThemePalette(color)['700']);
}

function toHexColor(value: string) {
	if (value.startsWith('#')) return value;

	const match = value.match(/^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/);
	if (!match) return value;

	const lightness = Number(match[1]) / 100;
	const chroma = Number(match[2]);
	const hue = (Number(match[3]) * Math.PI) / 180;
	const a = chroma * Math.cos(hue);
	const b = chroma * Math.sin(hue);

	const l_ = lightness + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = lightness - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = lightness - 0.0894841775 * a - 1.291485548 * b;

	const l = l_ ** 3;
	const m = m_ ** 3;
	const s = s_ ** 3;

	return `#${[
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	]
		.map(toSrgbChannel)
		.map((channel) => channel.toString(16).padStart(2, '0'))
		.join('')}`;
}

function toSrgbChannel(value: number) {
	const channel =
		value <= 0.0031308 ? 12.92 * value : 1.055 * Math.max(value, 0) ** (1 / 2.4) - 0.055;

	return Math.round(Math.min(1, Math.max(0, channel)) * 255);
}
