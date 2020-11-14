# `install-custom-font`

[![npm version](https://img.shields.io/npm/v/install-custom-font.svg?style=flat-square)](https://www.npmjs.com/package/install-custom-font)
[![npm downloads](https://img.shields.io/npm/dm/install-custom-font.svg?style=flat-square)](https://www.npmjs.com/package/install-custom-font)

## Basic Usage

```jsx
const { installFont, installFontsFromDir, clearCache } = require('install-custom-font');

Promise.all([
  installFont('~/Downloads/FONT.ttf'),
  installFont('~/Downloads/someother.otf'),
  installFont('~/Downloads/someweb.woff'),
  installFont('~/Downloads/someweeb.woff2')
]).then((results) => {
  console.log(results[0]); // { result: "was_added", ... }
  return installFont('~/Downloads/FONT.ttf'),
}).then((result) => {
  console.log(result); // { result: "already_added", ... }
  return installFont('~/Downloads/background.jpg')
}).then((result) => {
  console.log(result);
  // { result: "error", error: "Can only install ttf, otf, woff and woff2 fonts", ... }

  // clearCache will attempt to clear the font cache immediately, so you can see the
  // changes without having to log out or reboot
  return clearCache();
}).then(() => {
  // install all the fonts contained in a directory (does a recursive search for files within)
  // Note: you don't need to call clearCache after this function, as it does it for you
  return installFontsFromDir('~/Downloads/ComicSansMT/')
});
```

## Installation

```
npm install install-custom-font
```

## License

MIT
