# `install-custom-font`

[![npm version](https://img.shields.io/npm/v/install-custom-font.svg?style=flat-square)](https://www.npmjs.com/package/install-custom-font)
[![npm downloads](https://img.shields.io/npm/dm/install-custom-font.svg?style=flat-square)](https://www.npmjs.com/package/install-custom-font)

> Install fonts programmatically on MacOS and Linux

## Basic Usage

```jsx
const {
  installFont,
  installFontsFromDir,
  clearCache
} = require('install-custom-font')

;(async () => {
  const results = await Promise.all([
    installFont('~/Downloads/FONT.ttf'),
    installFont('~/Downloads/someother.otf'),
    installFont('~/Downloads/someweb.woff'),
    installFont('~/Downloads/someweeb.woff2')
  ])
  console.log(results[0]) // { result: "was_added", ... }

  // [2] when font is already installed, the result will show that
  await installFont('~/Downloads/FONT.ttf').then((result) => {
    console.log(result) // { result: "already_added", ... }
  })

  // [3] on errors, the result will be an error and a message explaining
  await installFont('~/Downloads/background.jpg').then((result) => {
    console.log(result)
    // { result: "error", error: "Can only install ttf, otf, woff and woff2 fonts", ... }
  })

  // clear the font cache so a reboot is not needed
  await clearCache()

  // [4] alternatively, a high-level function installFontsFromDir
  //     can be used, which installs all the fonts contained in a directory
  //     (does a recursive search for files within)

  // Note: clearCache is automatically called after this function, unless `interactive: false`
  // is added as an option
  await installFontsFromDir('~/Downloads/ComicSansMT/')
})()
```

### `installFont(pathToFont[, opts])`

### `installFontsFromDir(pathToDirContainingFonts[, opts])`

#### Options

```js
defaults: {
  // whether fonts should be installed globally or in the local directory
  global: false,
  // fast mode will skip scanning files for their file type, instead just using the file extension
  // it is disabled by default as the actual time cost seems very small
  fast: false,
  // if interactive, the cache will be cleared after installFontsFromDir automatically
  // this will ask the user for sudo privileges if required
  interactive: true,
  // highest priority at the start, lowest priority at the end:
  // * if you'd like to avoid importing a certain file type, omit it from this array
  // * if you're installing from a directory, this priority is used to determine
  //   which source file is used when two files refer to the same font
  // * by default, if a ttf font and a woff font have the same font family and style,
  //   the ttf will be used instead of the converted woff
  preferenceOrder: ['ttf', 'otf', 'woff', 'woff2']
}
```

## Installation

```
npm install install-custom-font
```

## License

MIT
