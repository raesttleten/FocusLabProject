export const THEMES = [
  { id: 'lila', label: 'Lila' },
  { id: 'verde', label: 'Verde' },
  { id: 'rosa', label: 'Rosa' },
  { id: 'azul', label: 'Azul' },
];

export const DEFAULT_THEME = 'lila';

export function themeFromColor(color) {
  return THEMES.find((theme) => theme.label === color)?.id ?? null;
}

export function colorFromTheme(themeId) {
  return THEMES.find((theme) => theme.id === themeId)?.label ?? null;
}
