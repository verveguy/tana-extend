# tana-extend

A first attempt to build a Tana extension mechanism as a Chrome extension.

This first cut uses shift-cmd-K (Mac) or shift-ctrl-K (Win/Linux) to pop up a little
"command prompt" in the middle of your current browser tab content. If you're using 
Tana in the standalone PWA mode, it works the same way.

You can then type a few characters to pick the command to run and hit enter.

Commands typically take the context of the clipboard as input. They all produce
output and place it on the clipboard. From there, you can paste it into Tana.

The output is minimally formatted as tana-paste format, with the specifics
being up to each individual command.

Here's a short video showing one use-case - invoking ChatGPT to process the 
nodes copied to the clipboard as a completion prompt. (the OpenAI API key shown 
here has been deleted, yes. :wink:)

## Brief demo video
https://user-images.githubusercontent.com/82237/227679044-8e27c744-aab0-40c5-a54b-750a9cfc6f14.mp4

## Installing
You'll need to download the latest release.zip and then use the Developer mode in Chrome
to add this extension as a `Load Unpacked`. Go to `chrome://extensions` and turn on Developer mode
I'll get around to pushing this to the Chrome Extension Store when it's good and ready.

## Configuration
Configuration of each command is available via the extension pop-up UI. Just click
the extension icon in the Chrome or Tana toolbar to access.

Looking for feedback, suggestions, pull requests and ideas for further commands, please!

## Building
Checkout the source and use `yarn install` then `yarn build`. The extension will be in `dist/`

You can also `yarn build watch` to make it easier as you hack on the code. Just remember to update
the extension via the Chrome extensions panel each time you do. 

# If anyone knows how to get VSCode debugging of Chrome Extensions built with Typescript to actually work, please let me know!
