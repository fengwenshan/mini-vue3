import { buildPackage, getBuildPackages } from './build-utils'
import { parseArgs } from 'node:util'

const root = process.cwd()
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    formats: {
      type: 'string',
      short: 'f'
    },
    devOnly: {
      type: 'boolean',
      short: 'd',
      default: false
    },
    prodOnly: {
      type: 'boolean',
      short: 'p',
      default: false
    },
    sourceMap: {
      type: 'boolean',
      short: 's',
      default: false
    }
  }
})

build()

async function build(): Promise<void> {
  const packages = await getBuildPackages(root)
  const targets = positionals.length
    ? packages.filter(target => positionals.some(name => target.dir.includes(name)))
    : packages

  if (!targets.length) {
    throw new Error('No buildable packages found.')
  }

  for (const target of targets) {
    await buildPackage(target, values)
    console.log(`built ${target.pkg.name}`)
  }
}
