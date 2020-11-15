import rawfs from 'fs'
import path from 'path'
import os from 'os'
import { fromFile } from 'file-type'
import isRoot from 'is-root'
import { getDestDir, installFont, installFontsFromDir } from './index'

const fs = rawfs.promises

const removeIfThere = async (filePath: string) => {
  try {
    await fs.unlink(filePath)
  } catch (err) {
    //
  }
}

describe('converts fonts correctly and moves to destDir', () => {
  it('installs otf font from path, locally', async () => {
    const expectedOutFile = `${getDestDir(false, 'otf')}/Inter Black.otf`

    await removeIfThere(expectedOutFile)
    await installFont('fixtures/Inter/Inter Desktop/Inter-Black.otf')

    expect(
      (
        await fromFile(
          path.join(
            process.cwd(),
            'fixtures/Inter/Inter Desktop/Inter-Black.otf'
          )
        )
      )?.ext
    ).toBe('otf')

    expect((await fromFile(expectedOutFile))?.ext).toBe('otf')
  })

  it('installs ttf font from path, locally', async () => {
    const expectedOutFile = `${getDestDir(false, 'ttf')}/Inter Italic.ttf`
    await removeIfThere(expectedOutFile)
    await installFont(
      'fixtures/Inter/Inter Hinted for Windows/Desktop/Inter-Italic.ttf'
    )

    expect(
      (
        await fromFile(
          path.join(
            process.cwd(),
            'fixtures/Inter/Inter Hinted for Windows/Desktop/Inter-Italic.ttf'
          )
        )
      )?.ext
    ).toBe('ttf')

    expect((await fromFile(expectedOutFile))?.ext).toBe('ttf')
  })

  it('installs woff font from path, locally', async () => {
    const expectedOutFile = `${getDestDir(false, 'woff')}/Inter Bold.ttf`
    await removeIfThere(expectedOutFile)
    await installFont('fixtures/Inter/Inter Web/Inter-Bold.woff')

    expect(
      (
        await fromFile(
          path.join(process.cwd(), 'fixtures/Inter/Inter Web/Inter-Bold.woff')
        )
      )?.ext
    ).toBe('woff')

    expect((await fromFile(expectedOutFile))?.ext).toBe('ttf')
  })

  it('installs woff2 font from path, locally', async () => {
    const expectedOutFile = `${getDestDir(false, 'woff2')}/Inter Medium.ttf`

    await removeIfThere(expectedOutFile)
    await installFont('fixtures/Inter/Inter Web/Inter-Medium.woff2')

    expect(
      (
        await fromFile(
          path.join(
            process.cwd(),
            'fixtures/Inter/Inter Web/Inter-Medium.woff2'
          )
        )
      )?.ext
    ).toBe('woff2')

    expect((await fromFile(expectedOutFile))?.ext).toBe('ttf')
  })

  it('installs same otf and ttf font globally on Linux, leading to a clash', async () => {
    if (os.platform() === 'linux' && isRoot()) {
      await removeIfThere(`${getDestDir(true, 'otf')}/Inter Regular.otf`)
      await removeIfThere(`${getDestDir(true, 'ttf')}/Inter Regular.ttf`)
      expect(
        (
          await installFont(
            'fixtures/Inter/Inter Hinted for Windows/Desktop/Inter-Regular.ttf',
            { global: true }
          )
        ).result
      ).toBe('was_added')
      expect(
        (
          await installFont('fixtures/Inter/Inter Desktop/Inter-Regular.otf', {
            global: true
          })
        ).result
      ).toBe('already_added')
    }
  })
})

describe('finds font files correctly', () => {
  it('scans a directory of font files and chooses the right ones', async () => {
    const mock = jest.fn()
    console.log = mock

    const results = await installFontsFromDir('fixtures/Inter', {
      interactive: false
    })
    const allFonts = results.map((result) => result.fontName).sort()

    const installedFonts = [
      'Inter Black Italic',
      'Inter Black Regular',
      'Inter Bold',
      'Inter Bold Italic',
      'Inter Extra Bold Italic',
      'Inter Extra Bold Regular',
      'Inter Extra Light Italic',
      'Inter Extra Light Regular',
      'Inter Italic',
      'Inter Light Italic',
      'Inter Light Regular',
      'Inter Medium Italic',
      'Inter Medium Regular',
      'Inter Regular',
      'Inter Regular',
      'Inter Semi Bold Italic',
      'Inter Semi Bold Regular',
      'Inter Thin Italic',
      'Inter Thin Regular',
      'Inter V Regular'
    ]

    expect(allFonts).toEqual(installedFonts)
    expect(results.every((result) => result.result !== 'error')).toBe(true)
    const allOutput = mock.mock.calls.join('\n')
    for (const font of installedFonts) {
      expect(allOutput).toMatch(`  ${font}`)
    }
  })

  it('has a fast mode which is actually faster', async () => {
    const mock = jest.fn()
    console.log = mock

    const normalStartTime = Date.now()
    const normalResults = await installFontsFromDir('fixtures/Inter', {
      interactive: false,
      fast: false
    })
    const normalDuration = Date.now() - normalStartTime

    const fastStartTime = Date.now()
    const fastResults = await installFontsFromDir('fixtures/Inter', {
      interactive: false,
      fast: true
    })
    const fastDuration = Date.now() - fastStartTime

    expect(fastResults).toEqual(normalResults)
    expect(fastDuration).toBeLessThanOrEqual(normalDuration)
  })
})

describe('getDestDir()', () => {
  it('matches the platform and filetype to the right fonts directory', async () => {
    const homeDir = os.homedir()
    expect(getDestDir(true, 'ttf', 'linux')).toBe('/usr/share/fonts/truetype')
    expect(getDestDir(true, 'otf', 'linux')).toBe('/usr/share/fonts/opentype')
    expect(getDestDir(true, 'woff', 'linux')).toBe('/usr/share/fonts/truetype')
    expect(getDestDir(true, 'woff2', 'linux')).toBe('/usr/share/fonts/truetype')

    expect(getDestDir(true, 'ttf', 'darwin')).toBe('/Library/Fonts')
    expect(getDestDir(true, 'otf', 'darwin')).toBe('/Library/Fonts')
    expect(getDestDir(true, 'woff', 'darwin')).toBe('/Library/Fonts')
    expect(getDestDir(true, 'woff2', 'darwin')).toBe('/Library/Fonts')

    expect(getDestDir(false, 'ttf', 'linux')).toBe(path.join(homeDir, '.fonts'))
    expect(getDestDir(false, 'otf', 'linux')).toBe(path.join(homeDir, '.fonts'))
    expect(getDestDir(false, 'woff', 'linux')).toBe(
      path.join(homeDir, '.fonts')
    )
    expect(getDestDir(false, 'woff2', 'linux')).toBe(
      path.join(homeDir, '.fonts')
    )

    expect(getDestDir(false, 'ttf', 'darwin')).toBe(
      path.join(homeDir, 'Library/Fonts')
    )
    expect(getDestDir(false, 'otf', 'darwin')).toBe(
      path.join(homeDir, 'Library/Fonts')
    )
    expect(getDestDir(false, 'woff', 'darwin')).toBe(
      path.join(homeDir, 'Library/Fonts')
    )
    expect(getDestDir(false, 'woff2', 'darwin')).toBe(
      path.join(homeDir, 'Library/Fonts')
    )
  })
})
