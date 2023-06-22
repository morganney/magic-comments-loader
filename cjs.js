import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const cjsDist = resolve('./dist/cjs')

for (const { name } of readdirSync(cjsDist, { withFileTypes: true })) {
  const filepath = resolve(cjsDist, name)
  const content = readFileSync(filepath).toString()

  /**
   * Change .js extension to .cjs in require() statements.
   * Write file back to original location.
   */
  writeFileSync(filepath, content.replace(/(.*require\(["]\..+\.)(js["]\).*)/g, '$1c$2'))
}
