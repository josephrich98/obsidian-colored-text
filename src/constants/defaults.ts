import { ColorsData } from "../types/plugin";

export const MAX_CELL_COUNT = 20;
export const DEFAULT_COLOR = '#000000';
export const DEFAULT_HIGHLIGHT_COLOR = '#ffff00';
export const DEFAULT_SETTINGS: Readonly<ColorsData> = {
  favoriteColors: [
    "#c00000",
    "#ff0000",
    "#ffc000",
    "#ffff00",
    "#92d050",
    "#00b050",
    "#00b0f0",
    "#0070c0",
    "#002060",
    "#7030a0"
  ],
  colorArr: Array(5).fill(DEFAULT_COLOR),
  colorCellCount: "5",
  hidePlugin: false,

  // Highlights are backgrounds, so the defaults are light tints that keep the
  // text on top of them readable in both themes.
  favoriteHighlightColors: [
    "#ffcdd2",
    "#ffe0b2",
    "#fff9b1",
    "#d3f8b6",
    "#b2f0e3",
    "#b3e5fc",
    "#c5cae9",
    "#e1bee7",
    "#f8bbd0",
    "#e0e0e0"
  ],
  highlightArr: Array(5).fill(DEFAULT_HIGHLIGHT_COLOR),
  highlightCellCount: "5"
};

export const STATUS_BAR_COLOR_LIGHT = '#f6f6f6';
export const STATUS_BAR_COLOR_DARK = '#262626';

export const COLORED_TEXT_MODE_HIGHLIGHTED_LIGHT = 'rgba(180, 180, 180, 0.3)';
export const COLORED_TEXT_MODE_HIGHLIGHTED_DARK = 'rgba(220, 220, 220, 0.3)';

export enum IndexMode {
  Forward,
  Backwards,
  Select
}

export enum ColorMode {
  Normal,
  ColoredText
}

/**
 * The two palettes the plugin manages. Everything that differs between
 * "color the text" and "highlight the text" is collected in PALETTE_SPECS so
 * the status bar, the modal and the text wrapping logic can all be shared.
 */
export enum PaletteKind {
  Text = 'text',
  Highlight = 'highlight'
}

export interface PaletteSpec {
  /** HTML tag written into the note */
  tag: string;
  /** CSS property set on that tag */
  cssProp: string;
  /** class of the status bar cells */
  cellClass: string;
  modeIcon: string;
  modeLabel: string;
  modalTitle: string;
  modalLabel: string;
  /** status bar items are laid out with `order`; each palette gets its own range */
  orderBase: number;
  defaultColor: string;
}

export const PALETTE_SPECS: Record<PaletteKind, PaletteSpec> = {
  [PaletteKind.Text]: {
    tag: 'span',
    cssProp: 'color',
    cellClass: 'status-color',
    modeIcon: 'type',
    modeLabel: 'Colored Text',
    modalTitle: 'Color Picker',
    modalLabel: 'Select a color',
    orderBase: 1,
    defaultColor: DEFAULT_COLOR
  },
  [PaletteKind.Highlight]: {
    tag: 'mark',
    cssProp: 'background',
    cellClass: 'status-highlight',
    modeIcon: 'highlighter',
    modeLabel: 'Highlight Text',
    modalTitle: 'Highlight Color Picker',
    modalLabel: 'Select a highlight color',
    orderBase: 100,
    defaultColor: DEFAULT_HIGHLIGHT_COLOR
  }
};

export function paletteColors(data: ColorsData, kind: PaletteKind): string[] {
  return kind === PaletteKind.Highlight ? data.highlightArr : data.colorArr;
}

export function paletteFavorites(data: ColorsData, kind: PaletteKind): string[] {
  return kind === PaletteKind.Highlight ? data.favoriteHighlightColors : data.favoriteColors;
}

export function paletteCellCount(data: ColorsData, kind: PaletteKind): string {
  return kind === PaletteKind.Highlight ? data.highlightCellCount : data.colorCellCount;
}
