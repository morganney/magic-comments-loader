import fs from 'fs'
import { execSync } from 'child_process'

import pkg from './package.json'

execSync('babel src --out-dir dist')

/**
 * Remove "type": "module" until webpack supports ES modules better
 */
delete pkg.type

pkg.main = 'index.js'

fs.writeFileSync('./dist/package.json', JSON.stringify(pkg, null, 2))
