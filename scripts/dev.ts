import { context } from 'esbuild'
import { createBuildOptions, getBuildPackages } from './build-utils'
import { parseArgs } from 'node:util'

const root = process.cwd()
const {
  values: { format, prod },
  positionals
} = parseArgs({
  allowPositionals: true,
  options: {
    format: {
      type: 'string',
      short: 'f',
      default: 'esm-bundler'
    },
    prod: {
      type: 'boolean',
      short: 'p',
      default: false
    }
  }
})

const build = async () => {
  const packages = await getBuildPackages(root)
  const targets = positionals.length
    ? packages.filter(target => positionals.some(name => target.dir.includes(name)))
    : packages

  if (!targets.length) {
    throw new Error('No buildable packages found.')
  }

  for (const target of targets) {
    const ctx = await context(createBuildOptions(target, format, {
      variant: prod ? 'production' : 'development',
      sourceMap: true
    }))
    await ctx.watch()
    console.log(`watching ${target.pkg.name} (${format}${prod ? ', prod' : ''})`)
  }
}

build()
