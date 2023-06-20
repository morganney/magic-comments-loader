import path from 'node:path'
import { fileURLToPath } from 'node:url'

import webpack from 'webpack'
import { createFsFromVolume, Volume } from 'memfs'

const { dirname, resolve, basename } = path
const filename = fileURLToPath(import.meta.url)
const directory = dirname(filename)
const loaderPath = resolve(directory, '../src/index.js')
const build = (entry, config = { loader: loaderPath }) => {
  const compiler = webpack({
    mode: 'none',
    context: directory,
    entry: `./${entry}`,
    output: {
      path: resolve(directory),
      filename: 'bundle.js'
    },
    resolve: {
      alias: {
        '@pkg': resolve(directory, '__fixtures__/pkg')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          ...config
        }
      ]
    }
  })

  compiler.outputFileSystem.join = path.join.bind(path)
  compiler.outputFileSystem = createFsFromVolume(new Volume())

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }

      if (stats.hasErrors()) {
        return reject(stats.toJson().errors)
      }

      return resolve(stats)
    })
  })
}

describe('loader', () => {
  const entry = '__fixtures__/basic.js'

  it('adds webpackChunkName magic comments', async () => {
    let stats = await build(entry)
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: {
            config: {
              basename: true
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "module" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: '__fixtures__/**/*.js'
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: ['__fixtures__/**/*.js', `!${entry}`]
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          match: 'import',
          webpackChunkName: 'folder/**/*.js'
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: {
            config: {
              active: true
            },
            overrides: [
              {
                files: '__no-match__/**/*.js',
                config: {
                  active: false
                }
              }
            ]
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: {
            config: {
              active: false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: false
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: {
            config: {
              active: (modulePath, importPath) => {
                if (modulePath === entry && importPath.includes('.js')) {
                  return true
                }
              }
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: (modulePath, importPath) => {
            return `${basename(modulePath, '.js')}-${basename(importPath, '.js')}`
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "basic-module" */ './folder/module.js')`
      )
    )

    stats = await build('__fixtures__/dynamic.js')
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        'import(/* webpackChunkName: "folder-[request]" */ `./folder/${slug}.js`)'
      )
    )
    expect(output).toEqual(
      expect.stringContaining(
        'import(/* webpackChunkName: "[request]" */ `./${slug}.json`)'
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackChunkName: {
            config: {
              active: false
            },
            overrides: [
              {
                files: ['__fixtures__/**/*.js'],
                config: {
                  active: true,
                  basename: true
                }
              }
            ]
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "module" */ './folder/module.js')`
      )
    )
  })

  it('adds webpackIgnore magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackIgnore: true
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining("import(/* webpackIgnore: true */ './folder/module.js')")
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackIgnore: {
            config: {
              active: false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining("import('./folder/module.js')"))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackIgnore: {
            config: {
              active: () => false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining("import('./folder/module.js')"))
  })

  it('adds webpackMode magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackMode: true
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackMode: "lazy" */ './folder/module.js')`)
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackMode: 'eager'
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackMode: "eager" */ './folder/module.js')`)
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackMode: () => 'weak'
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackMode: "weak" */ './folder/module.js')`)
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackMode: 'invalid'
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackMode: false
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackMode: {
            config: {
              active: false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackMode: {
            config: {
              active: (modulePath, importPath) => {
                if (modulePath.startsWith('__fixtures__') && importPath.endsWith('.js')) {
                  return false
                }
              }
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackMode: {
            config: {
              mode: 'lazy'
            },
            overrides: [
              {
                files: '__fixtures__/**/*.js',
                config: {
                  mode: 'eager'
                }
              }
            ]
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackMode: "eager" */ './folder/module.js')`)
    )
  })

  it('adds webpackPrefetch magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackPrefetch: true
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackPrefetch: true */ './folder/module.js')`)
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackPrefetch: (modulePath, importPath) => {
            if (modulePath.startsWith('__fixtures__') && importPath.endsWith('.js')) {
              return false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackPrefetch: {
            config: {
              active: () => false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))
  })

  it('adds webpackPreload magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackPreload: true
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackPreload: true */ './folder/module.js')`)
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackPreload: (modulePath, importPath) => {
            if (modulePath.startsWith('__fixtures__') && importPath.endsWith('.js')) {
              return false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackPreload: {
            config: {
              active: () => false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))
  })

  it('adds webpackExclude magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExclude: (modulePath, importPath) => {
            return new RegExp(importPath.replace(/^\.|\.js$/g, ''))
          }
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackExclude: /\\/folder\\/module/ */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExclude: {
            config: {
              active: false
            },
            overrides: [
              {
                files: '__fixtures__/**/*.js',
                config: {
                  /**
                   * `webpackExclude` and `webpackInclude` need to explicitly
                   * turn activation back on, rather than the loader infer
                   * activation from the presence of exclude/include properties
                   * in an override config.
                   */
                  active: true,
                  exclude: /\/folder\/module/
                }
              }
            ]
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackExclude: /\\/folder\\/module/ */ './folder/module.js')`
      )
    )
  })

  it('adds webpackInclude magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackInclude: (modulePath, importPath) => {
            return new RegExp(importPath.replace(/^\.|\.js$/g, ''))
          }
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackInclude: /\\/folder\\/module/ */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackInclude: {
            config: {
              active: false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackInclude: () => 'not a regex'
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackInclude: /\/folder\/module*/
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackInclude: /\\/folder\\/module*\\/ */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackInclude: {
            config: {
              active: () => false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))
  })

  it('adds webpackExports magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExports: (modulePath, importPath) => {
            return [modulePath.split('/')[0], importPath.split('/')[1]]
          }
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackExports: ["__fixtures__", "folder"] */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExports: {
            config: {
              exports: () => ['foo', 'bar']
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackExports: ["foo", "bar"] */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExports: {
            config: {
              exports: () => ['foo', 'bar']
            },
            overrides: [
              {
                files: '__fixtures__/**/*.js',
                config: {
                  exports: () => ['baz', 'qux']
                }
              }
            ]
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackExports: ["baz", "qux"] */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExports: {
            config: {
              exports: () => ['foo', 'bar']
            },
            overrides: [
              {
                files: '__no-match__/**/*.js',
                config: {
                  exports: () => ['baz', 'qux']
                }
              }
            ]
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackExports: ["foo", "bar"] */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExports: {
            config: {
              active: () => false
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExports: () => 'not an array'
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))
  })

  it('adds multiple magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          verbose: true,
          webpackChunkName: true,
          webpackMode: 'lazy',
          webpackInclude: /\.json$/
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module", webpackMode: "lazy", webpackInclude: /\\.json$/ */ './folder/module.js')`
      )
    )
  })

  it('parses most complex constructs for dynamic imports', async () => {
    let stats = await build('__fixtures__/complex.js')
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module" */ './folder/module.js')`
      )
    )
    expect(output).toEqual(
      expect.stringContaining(
        'import(/* webpackChunkName: "[request]" */ `./${slug}.json`)'
      )
    )
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackChunkName: "@pkg-foo" */ '@pkg/foo')`)
    )
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackChunkName: "@pkg-bar" */ '@pkg/bar')`)
    )
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackChunkName: "@pkg-baz" */ '@pkg/baz')`)
    )
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackChunkName: "@pkg-a" */ '@pkg/a')`)
    )
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackChunkName: "@pkg-b" */ '@pkg/b')`)
    )
    expect(output).toEqual(
      expect.stringContaining(`import(/* webpackChunkName: "@pkg-c" */ '@pkg/c')`)
    )
    expect(output).toEqual(
      expect.not.stringContaining(
        `import(/* webpackChunkName: "@fake-module" */ '@fake/module')`
      )
    )
  })
})
