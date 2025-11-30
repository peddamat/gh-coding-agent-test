export interface ColorOption {
  label: string;
  value: string;
  preview: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { label: 'Blue', value: 'bg-blue-500', preview: '#3b82f6' },
  { label: 'Pink', value: 'bg-pink-500', preview: '#ec4899' },
  { label: 'Green', value: 'bg-green-500', preview: '#22c55e' },
  { label: 'Purple', value: 'bg-purple-500', preview: '#a855f7' },
  { label: 'Orange', value: 'bg-orange-500', preview: '#f97316' },
];

/** Default color for Parent A */
export const DEFAULT_PARENT_A_COLOR = 'bg-blue-500';

/** Default color for Parent B */
export const DEFAULT_PARENT_B_COLOR = 'bg-pink-500';
