import { App, BaseComponent, ColorComponent, PluginSettingTab, Setting } from "obsidian";
import { DEFAULT_SETTINGS, PaletteKind, paletteFavorites } from "./constants/defaults";
import ColoredFont from "./main";

export class SettingsTab extends PluginSettingTab {
  plugin: ColoredFont;
  favoriteColorsSetting: Setting;
  favoriteHighlightColorsSetting: Setting;

  constructor(app: App, plugin: ColoredFont) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    /* ---------------- Text color ---------------- */
    containerEl.createEl("h3", { text: "Text Color" });

    new Setting(containerEl)
      .setName("Number of Color Cells")
      .setDesc("Change number of color cells (You need to reload Obsidian for changes to occur)")
      .addText((text) =>
        text
          .setPlaceholder("5")
          .setValue(this.plugin.colorsData.colorCellCount)
          .onChange(async (value) => {
            this.plugin.colorsData.colorCellCount = value;
            await this.plugin.saveColorData();
          })
      );

    this.favoriteColorsSetting = this.addFavoritesSetting(
      containerEl,
      PaletteKind.Text,
      "Favorite Colors",
      "Set your favorite colors to pick from"
    );

    /* ---------------- Highlight ---------------- */
    containerEl.createEl("h3", { text: "Highlight" });

    new Setting(containerEl)
      .setName("Number of Highlight Cells")
      .setDesc("Change number of highlight cells (You need to reload Obsidian for changes to occur)")
      .addText((text) =>
        text
          .setPlaceholder("5")
          .setValue(this.plugin.colorsData.highlightCellCount)
          .onChange(async (value) => {
            this.plugin.colorsData.highlightCellCount = value;
            await this.plugin.saveColorData();
          })
      );

    this.favoriteHighlightColorsSetting = this.addFavoritesSetting(
      containerEl,
      PaletteKind.Highlight,
      "Favorite Highlight Colors",
      "Set your favorite highlight colors to pick from"
    );

    /* ---------------- General ---------------- */
    containerEl.createEl("h3", { text: "General" });

    new Setting(containerEl)
      .setName("Hide Plugin in the Status Bar")
      .setDesc("(You need to reload Obsidian for changes to occur)")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.colorsData.hidePlugin)
          .onChange(async (value) => {
            this.plugin.colorsData.hidePlugin = value;
            await this.plugin.saveColorData();
          })
      })
  }

  private addFavoritesSetting(
    containerEl: HTMLElement,
    kind: PaletteKind,
    name: string,
    desc: string
  ): Setting {
    const setting = new Setting(containerEl)
      .setName(name)
      .setDesc(desc);

    paletteFavorites(this.plugin.colorsData, kind).forEach((c, i) => {
      setting.addColorPicker((color) =>
        color
          .setValue(c)
          .onChange(async (value) => {
            paletteFavorites(this.plugin.colorsData, kind)[i] = value;
            await this.plugin.saveColorData();
          })
      )
    });

    /* Restore default favorite colors */
    setting.addExtraButton((button) => {
      button
        .setIcon("rotate-ccw")
        .setTooltip("Restore defaults")
        .onClick(async () => {
          const defaults = paletteFavorites(DEFAULT_SETTINGS, kind);
          if (defaults !== undefined) {
            if (kind === PaletteKind.Highlight) {
              this.plugin.colorsData.favoriteHighlightColors = [...defaults];
            } else {
              this.plugin.colorsData.favoriteColors = [...defaults];
            }
          }
          this.reloadColors(setting.components, kind);
          await this.plugin.saveColorData();
        })
    });

    return setting;
  }

  reloadColors(components: BaseComponent[], kind: PaletteKind = PaletteKind.Text) {
    const favorites = paletteFavorites(this.plugin.colorsData, kind);
    let i = 0;
    for (const component of components) {
      if (component instanceof ColorComponent) {
        (component as ColorComponent)
          .setValue(favorites[i]);
        i++;
      }
    }
  }
}
