import('./folder/module.js').then(() => {
  const slug = 'module'
  const json = `foo-bar-baz-${import(`./${slug}.json`)}abc`

  return json
})
// import('@fake/module')
// import('@fake/module')

import(/* some comment */ './folder/skip.js')

import  (  './folder/stuff.js'  ) // comment above will cause this to be skipped

const foo = './module.json'
const bar = import(foo) // regex will miss this one
const reg = () => {}
/**
 * import('@fake/module')
 */

  /*
    blah
    import('@fake/module')

    with other text
      */
reg([
  {module: import('@pkg/foo'), elem: 'Foo'},
  {module: import('@pkg/bar'), elem: 'Bar',},
  {
    module: import('@pkg/baz'),
    elem: 'Baz',
  },
])

/*
* Lorem ipsum dolor sit amet
* import('@fake/module')
* import('@fake/module') foo import('@fake/module')
* import('@fake/module')
* Lorem ipsum.
*/

Promise.all([
  import('@pkg/a'),
  import('@pkg/b'),
  import('@pkg/c')
])

/* import in comment import('@fake/module') */
