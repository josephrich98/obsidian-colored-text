import { App, MarkdownView } from "obsidian";
import { ColorUtils } from "./colorUtils";
import StatusBar from "./statusBar";
import { ColorMode, PALETTE_SPECS, PaletteKind } from "./constants/defaults";

export class ColorHandler {
  app: App;
  colorUtils: ColorUtils;
  colorBar: StatusBar;
  highlightBar: StatusBar;

  constructor(app: App, colorBar: StatusBar, highlightBar: StatusBar) {
    this.app = app;
    this.colorBar = colorBar;
    this.highlightBar = highlightBar;

    this.colorUtils = new ColorUtils();
  }

  private barFor(kind: PaletteKind): StatusBar {
    return kind === PaletteKind.Highlight ? this.highlightBar : this.colorBar;
  }

  private nodeLength(n: any): number {
    if (!n) return 0;
    if (n.innerHTML) return n.innerHTML.length;
    if (n.textContent) return n.textContent.length;
    return 0;
  }

  private getGlobalOffsets(range: Range): { startOffset: number; endOffset: number } {
    let startOffset = range.startOffset;
    let wordLength = range.endOffset - range.startOffset;

    // Calculate the offset from the start of the document
    let node: Node | null = range.startContainer;
    let prev = node.previousSibling;
    while (prev) {
      startOffset += this.nodeLength(prev);
      prev = prev.previousSibling;
    }

    const endOffset = startOffset + wordLength;

    return { startOffset, endOffset };
  }

  /** Colors the selected text with the current cell of the text color palette. */
  changeColor(colorMode = ColorMode.Normal) {
    this.applyStyle(PaletteKind.Text, colorMode);
  }

  /** Highlights the selected text with the current cell of the highlight palette. */
  changeHighlight(colorMode = ColorMode.Normal) {
    this.applyStyle(PaletteKind.Highlight, colorMode);
  }

  applyStyle(kind: PaletteKind, colorMode = ColorMode.Normal) {
    const spec = PALETTE_SPECS[kind];
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);

    // Markdown View
    if (view) {
      const editor = view.editor;
      const selection = editor.getSelection();
      const curCellColor = this.barFor(kind).getCurCellColor();

      // If it is colored text mode and there is no selection, return
      if (selection.length === 0 && colorMode === ColorMode.ColoredText)
        return;

      // Handle italic and bold text within a single line's content
      const formatInline = (t: string) => t
        // Italic and Bold: ***text*** or ___text___ to <b><i> tags
        .replace(/[\*\_]{3}(.+?)[\*\_]{3}/g, '<b><i>$1</i></b>')
        // Bold: **text** or __text__ to <b> tag
        .replace(/[\*\_]{2}(.+?)[\*\_]{2}/g, '<b>$1</b>')
        // Italic: *text* or _text_ to <i> tag
        .replace(/[\*\_](.+?)[\*\_]/g, '<i>$1</i>');

      const openTag = `<${spec.tag} style="${spec.cssProp}:${curCellColor}">`;
      const closeTag = `</${spec.tag}>`;

      const wrapContent = (content: string) =>
        `${openTag}${formatInline(content)}${closeTag}`;

      // Wrap the selected part of a single editor line. A leading block marker
      // (indentation, blockquote >, list bullet -/*/+, ordered 1./1), checkbox)
      // is kept OUTSIDE the tag so the markdown block structure is preserved,
      // and lines are later joined with real newlines instead of <br> (which is
      // what previously collapsed lists onto a single line).
      //
      // `atLineStart` tells us whether the selected part actually begins at the
      // logical start of the line (only whitespace before it). Only then is a
      // leading marker a real list/quote marker. If the selection starts
      // mid-line, a leading "-", "1." etc. is just a literal character and must
      // be styled too -- this is the case the previous fix attempts couldn't
      // distinguish (see issue #45 / PR #55 discussion).
      const wrapLinePart = (part: string, atLineStart: boolean) => {
        // Empty part (blank line): leave it untouched
        if (part.length === 0) return part;
        if (!atLineStart) return wrapContent(part);

        const m = part.match(
          /^(\s*(?:>\s*)*(?:(?:[-*+]|\d+[.)])\s+)?(?:\[[ xX]\]\s+)?)(.*)$/
        );
        const prefix = m ? m[1] : '';
        const content = m ? m[2] : part;
        // Marker-only line: nothing to style, leave it untouched
        if (content.length === 0) return part;
        return `${prefix}${wrapContent(content)}`;
      };

      let newText = selection;
      if (selection.length > 0) {
        // Walk each editor line the selection covers so we can tell, per line,
        // whether the selection reaches the true start of that line.
        const from = editor.getCursor('from');
        const to = editor.getCursor('to');
        const parts: string[] = [];
        for (let ln = from.line; ln <= to.line; ln++) {
          const fullLine = editor.getLine(ln);
          const selStart = ln === from.line ? from.ch : 0;
          const selEnd = ln === to.line ? to.ch : fullLine.length;
          const part = fullLine.slice(selStart, selEnd);
          // The selected part begins at the logical line start if everything
          // before it on that line is whitespace (indentation) or nothing.
          const atLineStart = /^\s*$/.test(fullLine.slice(0, selStart));
          parts.push(wrapLinePart(part, atLineStart));
        }
        newText = parts.join('\n');
        editor.replaceSelection(newText);
      } else {
        // Normal mode with no selection: insert an empty tag pair and place
        // the cursor inside it (handled by the cursor logic below).
        editor.replaceSelection(`${openTag}${closeTag}`);
      }
      const cursorEnd = editor.getCursor("to");

      try {
        const cursorEndChar = newText.length === 0 ?
          cursorEnd.ch - closeTag.length : cursorEnd.ch + 1;
        editor.setCursor(cursorEnd.line, cursorEndChar);
      }
      catch (e) {
        // This code piece adds space to end of the doc if there is no space left
        const lineText = editor.getLine(cursorEnd.line);
        editor.setLine(cursorEnd.line, lineText + " ");
      }
    }

    // Canvas View
    const canvasView = this.app.workspace.getActiveViewOfType(Object as any);
    if (canvasView && (canvasView as any).canvas) {
      const selectedNodes = Array.from((canvasView as any).canvas.selection.values());
      const curCellColor = this.barFor(kind).getCurCellColor();

      for (const node of selectedNodes) {
        const data = (node as any).getData();
        if (data.type === "text") {
          const nodeEl = (node as any).nodeEl;
          const iframe = nodeEl.querySelector("iframe.embed-iframe") as HTMLIFrameElement;

          if (iframe) {
            const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
            const selection = innerDoc?.getSelection();

            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const selectedText = selection.toString();

              if (selectedText.length === 0 && colorMode === ColorMode.ColoredText) return;
              if (!innerDoc) return;

              const data = (node as any).getData();
              const fullText = data.text;

              const { startOffset, endOffset } = this.getGlobalOffsets(range);

              const before = fullText.slice(0, startOffset);
              const after = fullText.slice(endOffset);
              const wrapped =
                `<${spec.tag} style="${spec.cssProp}:${curCellColor}">${selectedText}</${spec.tag}>`;

              const newHtml = before + wrapped + after;

              (node as any).setData({
                ...data,
                text: newHtml,
              });

              if (selection) {
                try { selection.removeAllRanges(); } catch(e) { }
              }
            }
          }
        }
      }
    }
  }
}
