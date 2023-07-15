import path from 'node:path'
import { fileURLToPath } from 'node:url'

import webpack from 'webpack'
import { createFsFromVolume, Volume } from 'memfs'

const { dirname, resolve, basename, relative } = path
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
            options: {
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
          webpackChunkName: '**/__fixtures__/**/*.js'
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
          webpackChunkName: ['**/__fixtures__/**/*.js', `!**/${entry}`]
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
          webpackChunkName: '**/folder/**/*.js'
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
            options: {
              active: true
            },
            overrides: [
              {
                files: '**/__no-match__/**/*.js',
                options: {
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
            options: {
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
            options: {
              active: (modulePath, importPath) => {
                if (importPath.includes('.js')) {
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
            options: {
              active: false
            },
            overrides: [
              {
                files: ['**/__fixtures__/**/*.js'],
                options: {
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

  it('adds webpackFetchPriority magic comments', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackFetchPriority: true
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackFetchPriority: "auto" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackFetchPriority: false
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackFetchPriority: 'high'
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackFetchPriority: "high" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackFetchPriority: (modulePath, importPath) => {
            if (importPath.includes('module')) {
              return 'high'
            }

            return false
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackFetchPriority: "high" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackFetchPriority: {
            options: {
              fetchPriority: 'low'
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackFetchPriority: "low" */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackFetchPriority: {
            options: {
              fetchPriority: 'low'
            },
            overrides: [
              {
                files: '**/__fixtures__/**/*.js',
                options: {
                  fetchPriority: () => 'invalid priority'
                }
              }
            ]
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
          webpackFetchPriority: {
            options: {
              active: (modulePath, importPath) => {
                if (importPath.endsWith('.js')) {
                  return false
                }

                return true
              }
            }
          }
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(expect.stringContaining(`import('./folder/module.js')`))
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
            options: {
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
            options: {
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
            options: {
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
            options: {
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
            options: {
              mode: 'lazy'
            },
            overrides: [
              {
                files: '**/__fixtures__/**/*.js',
                options: {
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
            options: {
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
            options: {
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
            options: {
              active: false
            },
            overrides: [
              {
                files: '**/__fixtures__/**/*.js',
                options: {
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
          webpackInclude: /es\.json$/
        }
      }
    })
    output = stats.toJson({ source: true }).modules[0].source
    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackInclude: /es\\.json$/ */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackInclude: {
            options: {
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
            options: {
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
            const modPath = relative(process.cwd(), modulePath)

            return [modPath.split('/')[0], importPath.split('/')[1]]
          }
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackExports: ["__tests__", "folder"] */ './folder/module.js')`
      )
    )

    stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          webpackExports: {
            options: {
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
            options: {
              exports: () => ['foo', 'bar']
            },
            overrides: [
              {
                files: '**/__fixtures__/**/*.js',
                options: {
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
            options: {
              exports: () => ['foo', 'bar']
            },
            overrides: [
              {
                files: '**/__no-match__/**/*.js',
                options: {
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
            options: {
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
          webpackFetchPriority: 'high',
          webpackMode: 'lazy'
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module", webpackFetchPriority: "high", webpackMode: "lazy" */ './folder/module.js')`
      )
    )
  })

  it('parses complex constructs for dynamic imports', async () => {
    let stats = await build('__fixtures__/complex.js')
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import  (  /* webpackChunkName: "folder-stuff" */ './folder/stuff.js'  )`
      )
    )
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
      expect.stringContaining(`import(/* webpackChunkName: "foo" */ foo)`)
    )
    expect(output).toEqual(
      expect.stringContaining(`import(/* some comment */ './folder/skip.js')`)
    )
    expect(output).toEqual(
      expect.not.stringContaining(`import(/* webpackChunkName: "foo-bar" */ "foo/bar")`)
    )
    expect(output).toEqual(
      expect.not.stringContaining(
        `import(/* webpackChunkName: "@fake-module" */ '@fake/module')`
      )
    )
  })

  it('regexp mode finds dynamic imports in most complex constructs', async () => {
    let stats = await build('__fixtures__/complex.regexp.js', {
      use: {
        loader: loaderPath,
        options: {
          mode: 'regexp',
          verbose: true,
          webpackChunkName: true
        }
      }
    })
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
      expect.stringContaining(
        `import  (/* webpackChunkName: "folder-stuff" */ './folder/stuff.js')`
      )
    )
    expect(output).toEqual(
      expect.stringContaining(`import(/* some comment */ './folder/skip.js')`)
    )
    expect(output).toEqual(
      expect.not.stringContaining(
        `import(/* webpackChunkName: "@fake-module" */ '@fake/module')`
      )
    )
    expect(output).toEqual(
      expect.not.stringContaining(`import(/* webpackChunkName: "foo" */ foo)`)
    )
  })

  it('regex mode also supports default webpackChunkName option', async () => {
    let stats = await build('__fixtures__/complex.regexp.js', {
      use: {
        loader: loaderPath,
        options: {
          mode: 'regexp'
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(
      expect.stringContaining(
        `import(/* webpackChunkName: "folder-module" */ './folder/module.js')`
      )
    )
  })

  it('regex mode correctly ignores invalid comment option values', async () => {
    let stats = await build(entry, {
      use: {
        loader: loaderPath,
        options: {
          mode: 'regexp',
          webpackMode: () => 'invalid'
        }
      }
    })
    let output = stats.toJson({ source: true }).modules[0].source

    expect(output).toEqual(expect.stringContaining("import('./folder/module.js')"))
  })
})
