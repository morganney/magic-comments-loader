const slug = 'module'
const foo = await import(`./folder/${slug}.js`)
const bar = await import(`./${slug}.json`)
