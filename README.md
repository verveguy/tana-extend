# tana-extend

The first attempt to build a Tana extension mechanism as a Chrome extension.

This first cut uses shift-cmd-K (Mac) or shift-ctrl-K (Win/Linux) to pop up a little
"command prompt" in the middle of your current browser tab content. If you're using 
Tana in the standalone PWA mode, it works the same way.

You can then type a few characters to pick the command to run and hit enter.

Commands typically take the context of the clipboard as input. They all produce
output and place it on the clipboard. From there, you can paste it into Tana.

The output is minimally formatted as tana-paste format, with the specifics
being up to each individual command.

Here's a short video showing one use-case - invoking ChatGPT to process the 
nodes copied to the clipboard as a completion prompt. 

insert video here

Configuration of each command is available via the extension pop-up UI. Just click
the extension icon in the Chrome or Tana toolbar to access.

Looking for feedback, pull requests and ideas for further commands, please!

