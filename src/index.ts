import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import fontkit from 'fontkit'
import { fromFile } from 'file-type'
import { toSfnt } from 'woff-tools'
import { exec, execSync } from 'child_process'
import tmp from 'tmp'
import isRoot from 'is-root'

type ValidFontExt = 'ttf' | 'otf' | 'woff' | 'woff2'

type Config = {
  global: boolean
  preferenceOrder: [ValidFontExt, ValidFontExt, ValidFontExt, ValidFontExt]
}

const defaultConfig: Config = {
  global: false,
  preferenceOrder: ['ttf', 'otf', 'woff', 'woff2']
}

type Result = {
  result: 'was_added' | 'already_added' | 'error'
  path: string | null
  error: string | null
}

export const getDestDir = (
  global: boolean,
  ext: string,
  platform = os.platform()
): string => {
  let destDir: string
  if (platform === 'linux') {
    if (global) {
      destDir = `/usr/share/fonts/${ext === 'otf' ? 'opentype' : 'truetype'}`
    } else {
      destDir = path.join(os.homedir(), '.fonts')
    }
  } /* if (platform === "darwin") */ else {
    if (global) {
      destDir = '/Library/Fonts'
    } else {
      destDir = path.join(os.homedir(), 'Library/Fonts')
    }
  }
  return destDir
}

export const clearFontCache = (platform = os.platform()): void => {
  if (platform === 'darwin') {
    execSync(`sudo atsutil databases -remove`)
    execSync(`atsutil server -shutdown`)
    execSync(`atsutil server -ping`)
  } else {
    execSync(`sudo fc-cache -f -v`)
  }
}

// inspect font metadata and nest every font by its name
export const installFont = async (
  filePath: string,
  config?: Partial<Config>
): Promise<Result> => {
  // merge configs
  const cfg: Config = { ...defaultConfig, ...config }

  const fullPath = path.resolve(process.cwd(), filePath)

  try {
    // check if filepath exists
    if ((await fs.pathExists(fullPath)) && (await fs.stat(fullPath)).isFile()) {
      const fontFormat = await fromFile(fullPath)
      if (fontFormat?.ext) {
        const fontData = fontkit.openSync(fullPath)
        const ext = fontFormat.ext

        // check if it's already installed :)
        const destDir = getDestDir(cfg.global, ext)

        await fs.mkdirp(destDir)
        const finalFilePath = path.join(
          destDir,
          `${fontData.fullName}.${ext === 'otf' ? 'otf' : 'ttf'}`
        )

        if (fs.existsSync(finalFilePath)) {
          return {
            result: 'already_added',
            path: finalFilePath,
            error: `The font '${fontData.fullName}' is already installed`
          }
        } else if (
          os.platform() === 'linux' &&
          cfg.global &&
          fs.existsSync(
            `/usr/share/fonts/${ext === 'otf' ? 'truetype' : 'opentype'}/${
              fontData.fullName
            }.${ext === 'otf' ? 'ttf' : 'otf'}`
          )
        ) {
          return {
            result: 'already_added',
            path: finalFilePath,
            error: `The font '${
              fontData.fullName
            }' is already installed as an ${
              ext === 'otf' ? 'truetype' : 'opentype'
            } font`
          }
        } else if (ext === 'ttf' || ext === 'otf') {
          await fs.remove(finalFilePath)
          await fs.copy(fullPath, finalFilePath)
          return {
            result: 'was_added',
            path: finalFilePath,
            error: null
          }
        } else if (ext === 'woff') {
          await fs.writeFile(finalFilePath, toSfnt(await fs.readFile(fullPath)))
          return {
            result: 'was_added',
            path: finalFilePath,
            error: null
          }
        } else if (ext === 'woff2') {
          // relies on woff2_decompress being installed

          const isInstalled = await new Promise((resolve) => {
            exec(`woff2_decompress`, (_0, _1, stderr) => {
              if (`${stderr}`.includes('One argument')) {
                resolve(true)
              } else {
                resolve(false)
              }
            })
          })

          if (isInstalled) {
            const tmpobj = tmp.dirSync()

            // remove clash names from tmp
            const startFilePath = path.join(
              tmpobj.name,
              `${fontData.fullName}.woff2`
            )
            const endFilePath = path.join(
              tmpobj.name,
              `${fontData.fullName}.ttf`
            )
            await fs.remove(startFilePath)
            await fs.remove(endFilePath)

            // copy source to tmp
            await fs.copy(fullPath, startFilePath)

            // convert to ttf in tmp
            execSync(`woff2_decompress '${startFilePath}'`)

            // copy to dest
            await fs.remove(finalFilePath)
            await fs.move(endFilePath, finalFilePath)

            return {
              result: 'was_added',
              path: finalFilePath,
              error: null
            }
          } else {
            return {
              result: 'error',
              path: finalFilePath,
              error: 'woff2 needs to be installed to convert woff2 font files'
            }
          }
        } else {
          return {
            result: 'error',
            path: finalFilePath,
            error: 'Unsupported input font file format'
          }
        }
      } else {
        return {
          result: 'error',
          path: null,
          error: `Could not determine file type of '${fullPath}'.`
        }
      }
    } else {
      return {
        result: 'error',
        path: null,
        error: `File '${fullPath}' not found.`
      }
    }
  } catch (e) {
    console.log(e)
    return {
      result: 'error',
      path: null,
      error: e.message
    }
  }
}

async function* walk(dir: string): AsyncGenerator<string> {
  for await (const d of await fs.opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.isDirectory()) yield* await walk(entry)
    else if (d.isFile()) yield entry
  }
}

export const installFontsFromDir = async (
  dirPath: string,
  config?: Partial<Config>
) => {
  // merge configs
  const cfg: Config = { ...defaultConfig, ...config }

  const fullDirPath = path.resolve(process.cwd(), dirPath)

  const isValidDir =
    (await fs.pathExists(fullDirPath)) &&
    (await fs.stat(fullDirPath)).isDirectory()

  if (!isValidDir) {
    throw new Error(`Input dirPath does not exist, or is not a directory`)
  }

  const fontMap = new Map<
    string,
    {
      path: string
      ext: ValidFontExt
    }
  >()

  for await (const p of walk(fullDirPath)) {
    const fileType = await fromFile(p)
    if (fileType?.ext) {
      const ext = fileType.ext
      if (ext === 'ttf' || ext === 'otf' || ext === 'woff' || ext === 'woff2') {
        const fontData = fontkit.openSync(p)
        const prevMatchingFont = fontMap.get(fontData.fullName)
        if (
          !prevMatchingFont ||
          cfg.preferenceOrder.indexOf(ext) <
            cfg.preferenceOrder.indexOf(prevMatchingFont.ext)
        ) {
          fontMap.set(fontData.fullName, {
            path: p,
            ext
          })
        }
      }
    }
  }

  return Promise.all(
    [...fontMap.entries()].map((entry) => {
      const fontName = entry[0] as string
      const { path } = entry[1] as { path: string; ext: ValidFontExt }

      return installFont(path, cfg).then((result) => ({
        ...result,
        fontName
      }))
    })
  ).then(async (results) => {
    const fontsInstalled = []
    const fontsAlreadyInstalled = []
    for (const result of results) {
      if (result.result === 'error') {
        console.warn(
          `'${result.fontName}' was not installed:\n  ${result.error}`
        )
      } else if (result.result === 'was_added') {
        fontsInstalled.push(result.fontName)
      } else {
        fontsAlreadyInstalled.push(result.fontName)
      }
    }

    if (fontsInstalled.length > 0) {
      console.log(
        `Fonts installed:\n${fontsInstalled
          .sort()
          .map((f) => `  ${f}`)
          .join('\n')}`
      )
    }
    if (fontsAlreadyInstalled.length > 0) {
      console.log(
        `Fonts encountered that were previously installed:\n${fontsAlreadyInstalled
          .sort()
          .map((f) => `  ${f}`)
          .join('\n')}`
      )
    }

    if (isRoot()) {
      try {
        clearFontCache()
      } catch (e) {
        console.error('Encountered error when trying to clear the font cache.')
        console.error(e)
      }
    } else {
      console.log(
        'You may need to clear the font cache, or restart to see the changes.'
      )
    }
    return results
  })
}
