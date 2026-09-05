import { Editor, Menu } from "obsidian";
import removeColor from "./colorRemover";
import {ColorHandler} from "./colorHandler";
import {PaletteKind} from "./constants/defaults";

export default function contextMenu(
  menu: Menu,
  editor: Editor,
  colorHandler: ColorHandler
): void {
  const selection = editor.getSelection();

  if (selection) {
    menu.addItem((item) => {
      item
        .setTitle("Color Text")
        .onClick(() => {
          colorHandler.changeColor();
        });
    });

    menu.addItem((item) => {
      item
        .setTitle("Remove Color")
        .onClick(() => {
          removeColor(editor, PaletteKind.Text);
        })
    })

    menu.addItem((item) => {
      item
        .setTitle("Highlight Text")
        .onClick(() => {
          colorHandler.changeHighlight();
        });
    });

    menu.addItem((item) => {
      item
        .setTitle("Remove Highlight")
        .onClick(() => {
          removeColor(editor, PaletteKind.Highlight);
        })
    })
  }
}
