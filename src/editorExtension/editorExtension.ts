import {EditorView, PluginValue, ViewUpdate} from "@codemirror/view";
import {TextFormatting} from "./textFormatting";
import {ColorHandler} from "../colorHandler";
import StatusBar from "../statusBar";
import {ColorMode} from "../constants/defaults";

export class EditorExtension implements PluginValue {
  editorView : EditorView;
  textFormatting : TextFormatting;
  colorHandler : ColorHandler;
  colorBar : StatusBar;
  highlightBar : StatusBar;

  constructor(view: EditorView, colorHandler: ColorHandler, colorBar: StatusBar, highlightBar: StatusBar) {
    this.editorView = view;
    this.textFormatting = new TextFormatting(view);
    this.colorHandler = colorHandler;
    this.colorBar = colorBar;
    this.highlightBar = highlightBar;

    this.editorView.contentDOM.addEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseUp = () => {
    // The two modes are mutually exclusive (see StatusBar.clickColoredText)
    if(this.colorBar.coloredText)
      this.colorHandler.changeColor(ColorMode.ColoredText);
    else if(this.highlightBar.coloredText)
      this.colorHandler.changeHighlight(ColorMode.ColoredText);
  }

	update(update: ViewUpdate) {
    if(this.textFormatting.detectSandwichAsterisks(update)) {
      this.textFormatting.addStylingToSandwichAsterisks(update);
    }
	}

  destroy() {
    this.editorView.contentDOM.removeEventListener('mouseup', this.handleMouseUp)
  }
}

// This is needed for the editor extension to work, but don't really know why
export function createEditorExtensionClass(
  colorHandler: ColorHandler,
  colorBar: StatusBar,
  highlightBar: StatusBar
) {
	return class extends EditorExtension {
		constructor(view: EditorView) {
			super(view, colorHandler, colorBar, highlightBar);
		}
	};
}
