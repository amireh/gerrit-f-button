# gerrit-f-button

The F button is back.

![gerrit-f-button screenshot](./gerrit-f-button.png)

## Installation

Include the script somewhere in your gerrit page somehow, or use something like
[greasemonkey](http://www.greasespot.net/) to inject it.

I use [TamperMonkey](http://tampermonkey.net/) on Chrome.

The script expects `Gerrit` and `jQuery` to become available on `window` 
within 30 seconds since it gets loaded, otherwise it will not work. If it works, you can see a message on the console saying "gerrit-f-button" is active or something.

## Usage

Simply press F (or f) when you're viewing a change (or a file in a change revision) to bring up the glorious F-button frame.

## License

MIT