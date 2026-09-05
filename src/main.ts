import {Editor, Menu, Plugin} from 'obsidian';
import StatusBar from './statusBar';
import {ColorModal} from "./colorModal";
import {DEFAULT_SETTINGS, IndexMode, PaletteKind, paletteColors} from './constants/defaults';
import contextMenu from './contextMenu';
import {SettingsTab} from './settingsTab';
import {ColorsData} from './types/plugin';
import {createEditorExtensionClass} from "./editorExtension/editorExtension";
import removeColor from './colorRemover';
import {ViewPlugin} from "@codemirror/view";
import {ColorHandler} from "./colorHandler";

export default class ColoredFont extends Plugin {
  prevIndex: number;
  curTheme: string;

  colorsData: ColorsData;
  colorBar: StatusBar;
  highlightBar: StatusBar;
  colorHandler: ColorHandler;

  async onload() {
    // -------------------- Variables Init -------------------- //
    this.curTheme = this.getCurrentTheme();

    // -------------------- Settings -------------------- //
    await this.loadColorData();
    this.addSettingTab(new SettingsTab(this.app, this));

    // -------------------- Status Bar -------------------- //
    this.colorBar = new StatusBar(this, PaletteKind.Text);
    this.highlightBar = new StatusBar(this, PaletteKind.Highlight);
    this.colorBar.setSibling(this.highlightBar);
    this.highlightBar.setSibling(this.colorBar);

    // -------------------- Color Handler -------------------- //
    this.colorHandler = new ColorHandler(this.app, this.colorBar, this.highlightBar);

    // -------------------- Editor Extension -------------------- //
    const EditorExtensionClass = createEditorExtensionClass(
      this.colorHandler, this.colorBar, this.highlightBar);
    this.registerEditorExtension(ViewPlugin.fromClass(EditorExtensionClass));

    // -------------------- Intervals -------------------- //
    setInterval(() => {
      this.curTheme = this.getCurrentTheme();
      this.colorBar.refreshBorderColorOfCurrentCell();
      this.highlightBar.refreshBorderColorOfCurrentCell();
    }, 1000);

    // -------------------- Context Menu -------------------- //
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor) => {
        contextMenu(menu, editor, this.colorHandler);
      })
    );

    // -------------------- Commands: Text Color -------------------- //
    this.addCommand({
      id: 'color-text',
      name: 'Color Text',
      hotkeys: [],
      editorCallback: () => {
        this.colorHandler.changeColor();
      }
    });

    this.addCommand({
      id: 'alter-color-palette',
      name: 'Alter Color Palette',
      hotkeys: [],
      callback: () => {
        this.openColorModal(PaletteKind.Text);
      },
    })

    this.addCommand({
      id: 'move-color-cell-forward',
      name: 'Move the Color Cell Forward',
      hotkeys: [],
      callback: () => this.colorBar.changeCurrentIndex(IndexMode.Forward)
    })

    this.addCommand({
      id: 'move-color-cell-backwards',
      name: 'Change the Color Backwards',
      hotkeys: [],
      callback: () => this.colorBar.changeCurrentIndex(IndexMode.Backwards)
    })

    this.addCommand({
      id: "remove-color",
      name: "Remove Color From Selection / Under Cursor",
      hotkeys: [],
      editorCallback:(editor) => {
        removeColor(editor, PaletteKind.Text);
      }
    });

    this.addCommand({
      id: "change-colored-text-mode",
      name: "Activate/Deactivate Colored Text Mode",
      hotkeys: [],
      editorCallback: () => {
        this.colorBar.clickColoredText()
      }
    })

    // -------------------- Commands: Highlight -------------------- //
    this.addCommand({
      id: 'highlight-text',
      name: 'Highlight Text',
      hotkeys: [],
      editorCallback: () => {
        this.colorHandler.changeHighlight();
      }
    });

    this.addCommand({
      id: 'alter-highlight-palette',
      name: 'Alter Highlight Color Palette',
      hotkeys: [],
      callback: () => {
        this.openColorModal(PaletteKind.Highlight);
      },
    })

    this.addCommand({
      id: 'move-highlight-cell-forward',
      name: 'Move the Highlight Cell Forward',
      hotkeys: [],
      callback: () => this.highlightBar.changeCurrentIndex(IndexMode.Forward)
    })

    this.addCommand({
      id: 'move-highlight-cell-backwards',
      name: 'Move the Highlight Cell Backwards',
      hotkeys: [],
      callback: () => this.highlightBar.changeCurrentIndex(IndexMode.Backwards)
    })

    this.addCommand({
      id: "remove-highlight",
      name: "Remove Highlight From Selection / Under Cursor",
      hotkeys: [],
      editorCallback:(editor) => {
        removeColor(editor, PaletteKind.Highlight);
      }
    });

    this.addCommand({
      id: "change-highlight-text-mode",
      name: "Activate/Deactivate Highlight Text Mode",
      hotkeys: [],
      editorCallback: () => {
        this.highlightBar.clickColoredText()
      }
    })
  }

  onunload() {

  }

  private getCurrentTheme() {
    // @ts-expect-error private
    let theme = this.app.getTheme();

    if (theme === 'moonstone') {
      theme = 'light';
    } else if (theme === 'obsidian') {
      theme = 'dark';
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return theme;
  }

	openColorModal(kind: PaletteKind = PaletteKind.Text) {
    const bar = kind === PaletteKind.Highlight ? this.highlightBar : this.colorBar;

    new ColorModal(this.app, this, bar.getCurCellColor(), kind, (result) => {
      bar.changeCellColor(result);

      paletteColors(this.colorsData, kind)[bar.curIndex] = result;
      this.saveColorData();
    }).open();
	}

  async loadColorData() {
    this.colorsData = Object.assign({},
      {
        ...DEFAULT_SETTINGS,
        colorArr: [...DEFAULT_SETTINGS.colorArr],
        favoriteColors: [...DEFAULT_SETTINGS.favoriteColors],
        highlightArr: [...DEFAULT_SETTINGS.highlightArr],
        favoriteHighlightColors: [...DEFAULT_SETTINGS.favoriteHighlightColors],
      }, await this.loadData());
  }

  async saveColorData() {
    await this.saveData(this.colorsData);
  }
}
