# Obsidian Colored Text Plugin

This is a plugin for [Obsidian](https://obsidian.md/) for adding colored texts to your notes.

## Features

- There are slots for storing colors which can be in the status bar. By default, the number of slots is set to 5, but it can be adjusted to any value between 1 and 20 in the settings.
- You can switch between slots, either by using hotkeys or by clicking on color slots
- You can change the current slot's color by opening the color input menu, by using the hotkey, or by clicking the desired color cell in the status bar
- In the input menu, there are two ways to select colors. You can either select from your favorite colors, which is set to the most used colors by default and can be customized in the settings, or you can select a customized color by using the color palette
- You can change the color of the selected text into the current slot's color by using the assigned hotkey or right-clicking
- You can remove the color of the selected text by using the assigned hotkey or right-clicking
- Colored text mode is added, you can activate it through the text icon in the status bar or assign a hotkey
- There is a second, independent set of slots for **highlight** colors. It works exactly like the color slots (own count, own favorites, own hotkeys) but wraps the selection in `<mark style="background:...">` instead of `<span style="color:...">`. Highlight slots are drawn as circles in the status bar so they are easy to tell apart from the square color slots.

## Usage

Commands available for text color:
- Color Text
- Remove Color From Selection / Under Cursor
- Move the Color Cell Forward
- Change the Color Backwards
- Alter Color Palette (opens the color input menu)
- Activate/Deactivate Colored Text Mode

And the matching commands for highlighting:
- Highlight Text
- Remove Highlight From Selection / Under Cursor
- Move the Highlight Cell Forward
- Move the Highlight Cell Backwards
- Alter Highlight Color Palette (opens the highlight color input menu)
- Activate/Deactivate Highlight Text Mode

Colored text mode and highlight text mode are mutually exclusive; turning one on turns the other off.

I suggest using hotkeys for these commands as I designed this plugin with a keyboard-centric approach.

## Demo

[![Watch the video](https://img.youtube.com/vi/BhB0Ax7HFM0/maxresdefault.jpg)](https://www.youtube.com/watch?v=BhB0Ax7HFM0&t=115s)
This video is not mine, but thanks to Obsidian Tutorial for making a demo of this plugin

## Maintenance Notice
**Note:** As of **October 2025**, this plugin has entered **maintenance mode**.

I've been maintaning it for about 2.5 years, and while it has reached a stable and reliable state, I no longer have the motivation or time to continue active development.

The plugin will remain available and functional, and I’ll do my best to review critical bug reports or pull requests when possible.

**Community contributions are welcome!**

If you’d like to improve or extend the plugin (for example, by adding MathJax support or solving bullet point bug), feel free to open a PR or discussion.

### Areas of improvement
- [ ] Add LaTeX/MathJax color support
- [x] Fixing bullet point [bug](https://github.com/erincayaz/obsidian-colored-text/issues/45) --> solved by @brunobeeee
- [ ] Making the plugin work properly for mobile devices
- [ ] Fixing coloring headings [bug](https://github.com/erincayaz/obsidian-colored-text/issues/35)
- [ ] Further improvements can be made as can be seen [here](https://github.com/erincayaz/obsidian-colored-text/issues/43)
- [ ] Coloring doesn't work for added cards that is referencing an existing note
