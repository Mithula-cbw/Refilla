// Shared avatar color utility for consistent display
export const AVATAR_COLORS = [
  '#388bfd', '#4caf6e', '#d29922', '#bc8cff',
  '#79c0ff', '#f85149', '#56d364', '#e3b341',
];

let _colorIndex = 0;
export function nextAvatarColor(): string {
  const color = AVATAR_COLORS[_colorIndex % AVATAR_COLORS.length];
  _colorIndex++;
  return color;
}

export function getAvatarInitial(label: string): string {
  return label.trim().charAt(0).toUpperCase() || '?';
}

export interface AvatarProps {
  label: string;
  color: string;
  size?: number;
  fontSize?: number;
}
