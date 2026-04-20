import fs from 'node:fs/promises'
import path from 'node:path'
import type { BuildOptions, Format } from 'esbuild'
import { build } from 'esbuild'

export type BuildVariant = 'development' | 'production' | 'test'

export interface BuildConfig {
  variant: BuildVariant
  sourceMap: boolean
}

export interface BuildAllOptions {
  formats?: string
  devOnly?: boolean
  prodOnly?: boolean
  sourceMap?: boolean
}

export interface PackageJson {
  name: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  buildOptions?: {
    name?: string
    formats?: string[]
  }
}

export interface BuildPackage {
  dir: string
  pkg: PackageJson
  entry: string
  dist: string
}

export const defaultDefines: Record<string, string> = {
  __COMMIT__: JSON.stringify('dev'),
  __VERSION__: JSON.stringify('1.0.0'),
  __BROWSER__: 'true',
  __GLOBAL__: 'false',
  __ESM_BUNDLER__: 'false',
  __ESM_BROWSER__: 'false',
  __CJS__: 'false',
  __SSR__: 'false',
  __TEST__: 'false'
}

export async function getBuildPackages(root: string): Promise<BuildPackage[]> {
  const packagesDir = path.resolve(root, 'packages')
  const dirs = await fs.readdir(packagesDir)
  const packages: BuildPackage[] = []

  for (const dir of dirs) {
    const pkgPath = path.resolve(packagesDir, dir, 'package.json')
    const entry = path.resolve(packagesDir, dir, 'src/index.ts')

    try {
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8')) as PackageJson
      await fs.access(entry)

      if (pkg.buildOptions) {
        packages.push({
          dir,
          pkg,
          entry,
          dist: path.resolve(packagesDir, dir, 'dist')
        })
      }
    } catch {
      // Packages without package.json or src/index.ts are not build targets.
    }
  }

  return packages
}

export function createBuildOptions(
  target: BuildPackage,
  formatName: string,
  config: BuildConfig
): BuildOptions {
  const { format, outfile, globalName } = resolveFormat(target, formatName, config)
  const deps = Object.keys(target.pkg.dependencies ?? {})
  const peerDeps = Object.keys(target.pkg.peerDependencies ?? {})
  const isProd = config.variant === 'production'

  return {
    entryPoints: [target.entry],
    bundle: true,
    sourcemap: config.sourceMap,
    minify: isProd,
    target: 'es2016',
    platform: formatName === 'cjs' ? 'node' : 'browser',
    format,
    outfile,
    globalName,
    define: {
      ...defaultDefines,
      __VERSION__: JSON.stringify(target.pkg.name),
      __DEV__: String(!isProd && config.variant !== 'test'),
      __TEST__: String(config.variant === 'test'),
      __BROWSER__: String(formatName !== 'cjs'),
      __GLOBAL__: String(formatName === 'global'),
      __ESM_BUNDLER__: String(formatName === 'esm-bundler'),
      __ESM_BROWSER__: String(formatName === 'esm-browser'),
      __CJS__: String(formatName === 'cjs'),
      __SSR__: String(formatName !== 'global'),
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development')
    },
    external: formatName === 'esm-bundler' || formatName === 'cjs'
      ? [...deps, ...peerDeps]
      : []
  }
}

export async function buildPackage(target: BuildPackage, options: BuildAllOptions): Promise<void> {
  if (!options.formats) {
    await fs.rm(target.dist, { recursive: true, force: true })
  }

  await fs.mkdir(target.dist, { recursive: true })

  const formats = getFormats(target, options.formats)
  for (const format of formats) {
    for (const variant of getBuildVariants(format, options)) {
      await build(createBuildOptions(target, format, {
        variant,
        sourceMap: Boolean(options.sourceMap) || variant !== 'production'
      }))
    }
  }
}

export function getFormats(target: BuildPackage, requestedFormats?: string): string[] {
  if (requestedFormats) {
    return requestedFormats.split(',').map(format => format.trim()).filter(Boolean)
  }

  const formats = target.pkg.buildOptions?.formats ?? ['esm-bundler']
  return formats
}

export function getBuildVariants(format: string, options: BuildAllOptions): BuildVariant[] {
  if (options.devOnly) {
    return ['development']
  }

  if (options.prodOnly) {
    return ['production']
  }

  return format === 'esm-bundler' ? ['development'] : ['development', 'production']
}

function resolveFormat(
  target: BuildPackage,
  formatName: string,
  config: BuildConfig
): { format: Format, outfile: string, globalName?: string } {
  const fileBase = target.dir
  const prodSuffix = config.variant === 'production' && formatName !== 'esm-bundler'
    ? '.prod'
    : ''

  switch (formatName) {
    case 'esm-bundler':
      return {
        format: 'esm',
        outfile: path.resolve(target.dist, `${fileBase}.esm-bundler.js`)
      }
    case 'esm-browser':
      return {
        format: 'esm',
        outfile: path.resolve(target.dist, `${fileBase}.esm-browser${prodSuffix}.js`)
      }
    case 'cjs':
      return {
        format: 'cjs',
        outfile: path.resolve(target.dist, `${fileBase}.cjs${prodSuffix}.js`)
      }
    case 'global':
      return {
        format: 'iife',
        outfile: path.resolve(target.dist, `${fileBase}.global${prodSuffix}.js`),
        globalName: target.pkg.buildOptions?.name
      }
    default:
      throw new Error(`Unsupported build format "${formatName}" in ${target.pkg.name}.`)
  }
}
