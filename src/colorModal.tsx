import { App, Modal, Setting } from "obsidian";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import ColorPalette from "./components/ColorPalette";
import ColoredFont from "./main";
import {ColorUtils} from "./colorUtils";
import {PALETTE_SPECS, PaletteKind, PaletteSpec, paletteFavorites} from "./constants/defaults";

export class ColorModal extends Modal {
  private colorResult: string;
  private prevColor: string;
  onSubmit: (result: string) => void;
  private colorPaletteRoot: Root;
  private colorUtils: ColorUtils;
  private readonly kind: PaletteKind;
  private readonly spec: PaletteSpec;
  plugin: ColoredFont;

  constructor(
    app: App,
    plugin: ColoredFont,
    prevColor: string,
    kind: PaletteKind,
    onSubmit: (result: string) => void
  ) {
    super(app);

    this.colorUtils = new ColorUtils();
    this.colorResult = prevColor;
    this.plugin = plugin;
    this.kind = kind;
    this.spec = PALETTE_SPECS[kind];
    this.prevColor = this.colorUtils.rgbToHex(prevColor);
    this.onSubmit = onSubmit;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h1", { text: this.spec.modalTitle });
    contentEl.createDiv();
    this.colorPaletteRoot = createRoot(contentEl.children[1]);

    this.colorPaletteRoot.render(
      <React.StrictMode>
        <div
          className="setting-item"
          style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
        >
          <div>{this.spec.modalLabel}</div>
          <ColorPalette
            colors={paletteFavorites(this.plugin.colorsData, this.kind)}
            onModalColorClick={this.onModalColorClick}
          />
        </div>
      </React.StrictMode>
    );

    new Setting(contentEl)
      .setName("Custom color")
      .addColorPicker((color) =>
        color
          .setValue(this.prevColor)
          .onChange((value) => {
            this.colorResult = value;
          })
      );

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Submit")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.colorResult);
          })
      );
  }

  onClose() {
    const { contentEl } = this;
    this.colorPaletteRoot.unmount();
    contentEl.empty();
  }

  onModalColorClick = (color: string) => {
    this.colorResult = color;
  }
}
