import ColoredFont from "./main";
import {setIcon} from "obsidian";
import {
  COLORED_TEXT_MODE_HIGHLIGHTED_DARK,
  COLORED_TEXT_MODE_HIGHLIGHTED_LIGHT,
  IndexMode,
  MAX_CELL_COUNT,
  PALETTE_SPECS,
  PaletteKind,
  PaletteSpec,
  paletteCellCount,
  paletteColors
} from "./constants/defaults";
import {ColorUtils} from "./colorUtils";

export default class StatusBar {
  private colorUtils : ColorUtils;
  private plugin : ColoredFont;

  public readonly kind : PaletteKind;
  private readonly spec : PaletteSpec;

  private coloredTextButton : HTMLElement;
  private colorDivs : HTMLDivElement[] = [];

  private readonly cellCount : number;
  private readonly hidePlugin : boolean;

  /** The other palette's bar; only one of the two auto-apply modes may be on. */
  private sibling : StatusBar | null = null;

  public curIndex : number;
  private prevIndex : number;
  public coloredText : boolean;

  constructor(plugin: ColoredFont, kind: PaletteKind = PaletteKind.Text) {
    this.colorUtils = new ColorUtils();
    this.plugin = plugin;
    this.kind = kind;
    this.spec = PALETTE_SPECS[kind];

    this.curIndex = 0;
    this.prevIndex = 0;
    this.coloredText = false;

    const count = +paletteCellCount(plugin.colorsData, kind);
    this.cellCount = count > MAX_CELL_COUNT ? MAX_CELL_COUNT : count;
    this.hidePlugin = plugin.colorsData.hidePlugin;

    this.addColorCells(plugin);
    this.addColoredTextMode(plugin);
  }

  setSibling(sibling: StatusBar) {
    this.sibling = sibling;
  }

  addColorCells(plugin: ColoredFont) {
    const onClickColorBar = (index: number) => () => {
      if(this.curIndex === index) {
        plugin.openColorModal(this.kind);
      }
      else {
        this.changeCurrentIndex(IndexMode.Select, index);
      }
    }

    const colors = paletteColors(plugin.colorsData, this.kind);

    for (let i = 0; i < this.cellCount; i++) {
      const statusBarColor = plugin.addStatusBarItem();

      statusBarColor.style.paddingLeft = "0";
      statusBarColor.style.paddingRight = "0";
      statusBarColor.style.order = `${this.spec.orderBase + i + 1}`;

      if(this.hidePlugin) {
        statusBarColor.style.height = "0";
        statusBarColor.style.width = "0";
      }

      statusBarColor.addClasses(["mod-clickable"]);
      statusBarColor.addEventListener("click", onClickColorBar(i));

      const colorIcon = statusBarColor.createDiv(
        {
          cls: ['status-color', this.spec.cellClass],
        }
      );

      // TODO: Find a better way to do this
      if (i > colors.length - 1) {
        colorIcon.style.backgroundColor = this.spec.defaultColor;
      }
      else {
        colorIcon.style.backgroundColor = colors[i];
      }
      this.colorDivs.push(colorIcon);
    }

    if(!this.hidePlugin) {
      this.colorDivs[0].style.borderStyle = 'solid';
      this.colorDivs[0].style.borderColor =
        this.colorUtils.getContrastBorderColor(this.getCurCellColor(), plugin.curTheme);
    }
  }

  addColoredTextMode(plugin: ColoredFont) {
    const item = plugin.addStatusBarItem();
    item.style.order = `${this.spec.orderBase}`;
    item.ariaLabel = this.spec.modeLabel;

    this.coloredTextButton = item;

    item.addClass("mod-clickable");
    item.addEventListener("click", this.onClickColoredText());

    setIcon(item, this.spec.modeIcon);

    if(this.hidePlugin) {
      item.style.height = "0";
      item.style.width = "0";
    }
  }

  clickColoredText() {
    this.coloredText = !this.coloredText;

    // The two auto-apply modes would fight over the same selection, so turning
    // one on turns the other off.
    if(this.coloredText && this.sibling?.coloredText) {
      this.sibling.clickColoredText();
    }

    if(!this.hidePlugin) {
      const coloredTextHighlightColor = this.plugin.curTheme === 'dark' ?
        COLORED_TEXT_MODE_HIGHLIGHTED_DARK : COLORED_TEXT_MODE_HIGHLIGHTED_LIGHT;

      this.coloredTextButton.style.backgroundColor = this.coloredText ?
        coloredTextHighlightColor : 'rgba(220, 220, 220, 0)';
    }
  }

  changeCurrentIndex(indexMode: IndexMode, newIndex = 0) {
    this.prevIndex = this.curIndex

    if(indexMode === IndexMode.Select) {
      this.curIndex = newIndex;
    } else if(indexMode === IndexMode.Forward) {
      this.curIndex = this.curIndex + 1 >= this.cellCount ? 0 : this.curIndex + 1;
    } else {
      this.curIndex = this.curIndex - 1 < 0 ? this.cellCount - 1 : this.curIndex - 1;
    }

    if(!this.hidePlugin) {
      this.colorDivs[this.prevIndex].style.borderStyle = 'none';

      this.colorDivs[this.curIndex].style.borderStyle = 'solid';
      this.colorDivs[this.curIndex].style.borderColor =
        this.colorUtils.getContrastBorderColor(this.getCurCellColor(), this.plugin.curTheme);
    }
  }

  refreshBorderColorOfCurrentCell() {
    this.colorDivs[this.curIndex].style.borderColor =
      this.colorUtils.getContrastBorderColor(this.getCurCellColor(), this.plugin.curTheme);
  }

  changeCellColor(modalResult: string) {
    this.colorDivs[this.curIndex].style.backgroundColor = modalResult;
  }

  getCurCellColor() {
    return this.colorDivs[this.curIndex].style.backgroundColor;
  }

  private onClickColoredText = () => () => {
    this.clickColoredText();
  }
}
