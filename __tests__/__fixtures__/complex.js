import('./folder/module.js').then(() => {
  const slug = 'module'
  const json = import(`./${slug}.json`)

  return json
})
// import('@fake/module')
// import('@fake/module')

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
