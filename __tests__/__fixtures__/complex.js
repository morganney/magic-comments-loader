import('./folder/module.js').then(() => {
  const slug = 'module'
  const json = `foo-bar-baz-${import(`./${slug}.json`)}abc`
  const myString = 'abc,import("foo/bar")xyz' // In 'regexp' mode this string would be incorrectly targeted

  return json
})
// import('@fake/module')
// import('@fake/module')

import(/* some comment */ './folder/skip.js')

import  (  './folder/stuff.js'  )
const foo = './module.json'
/**
 * regex will miss this one, however webpack does not support this syntax.
 * @see https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import
 */
const bar = import(foo)
/*
   This comment style will break the build in regexp mode if it
   spans more than one line and includes import('module')
   strings more than once. Like import('module2').
*/
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
