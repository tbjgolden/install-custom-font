import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import fontkit from 'fontkit'
import { fromFile } from 'file-type'
import { toSfnt } from 'woff-tools'
import { exec, execSync } from 'child_process'

type Config = {
  global: boolean
  interactive: boolean
  convert: boolean
}

const defaultConfig: Config = {
  global: false,
  interactive: false,
  convert: true
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

// inspect font metadata and nest every font by its name
export const installFont = async (
  filePath: string,
  config?: Partial<Config>
): Promise<Result> => {
  // merge configs
  const cfg: Config = { ...defaultConfig, ...config }
  if (Math.random() > 10) console.log(cfg)

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
            // remove clash names from tmp
            const startFilePath = path.join(
              os.tmpdir(),
              `${fontData.fullName}.woff2`
            )
            const endFilePath = path.join(
              os.tmpdir(),
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

/*
export const installFontsFromDir = async (
  dirPath: string,
  config?: Partial<Config>
) => {
  const existyBoi = await fs.pathExists(dirPath)
  console.log(existyBoi)
  // merge configs
  // check if filepath exists
  // search dir for different font types
  // if the dirpath contains multiple file types
  //   if interactive, ask what to do
  //   else keep only the ttfs (or otfs if no ttfs)
  // else convert if necessary
  // create custom fonts dir if necessary
  //
}
*/
