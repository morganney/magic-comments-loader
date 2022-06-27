# [`magic-comments-loader`](https://www.npmjs.com/package/magic-comments-loader)

![CI](https://github.com/morganney/magic-comments-loader/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/magic-comments-loader/branch/master/graph/badge.svg?token=1DWQL43B8V)](https://codecov.io/gh/morganney/magic-comments-loader)

Keep your source code clean, add [magic coments](https://webpack.js.org/api/module-methods/#magic-comments) to your dynamic `import()` statements at build time.

NOTE: **This loader ignores dynamic imports that already include comments of any kind**.

All magic comments are supported:
* `webpackChunkName`
* `webpackMode`
* `webpackIgnore`
* [`webpackPreload`](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)
* [`webpackPrefetch`](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)
* `webpackInclude`
* `webpackExclude`
* `webpackExports`

## Getting Started

First install `magic-comments-loader`:

```
npm install magic-comments-loader
```

Next add the loader to your `webpack` config:

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['magic-comments-loader']
    }
  ]
}
```

Then given a **file.js** with the following import:

```js
const dynamicModule = await import('./path/to/module.js')
```

While running `webpack` the import inside **file.js** becomes:

```js
const dynamicModule = await import(/* webpackChunkName: "path-to-module" */ './path/to/module.js')
```

## Configuration

The above webpack configuration will add `webpackChunkName` magic comments to all dynamic imports (same as `webpackChunkName: true` when using options) using the hyphenated import path as the chunk name. The loader also supports configuration with options.

### With options

The loader `options` is an object with keys corresponding to the names of supported magic comments. The following comments have a default behavior and do not require configuration beyond specifying where they should be applied (globally, or to certain files).

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'magic-comments-loader',
        options: {
          webpackChunkName: true,
          webpackMode: 'lazy',
          webpackIgnore: 'src/ignore/**/*.js',
          webpackPrefetch: 'src/prefetch/**/*.js',
          webpackPreload: [
            'src/preload/**/*.js',
            '!src/preload/skip/**/*.js'
          ]
        }
      }
    }
  ]
}
```

### With `config` options

For more control, all comments support a configuration object with two supported keys, `config` and `overrides`. The `config` key is an object used to specifiy [comment options](#options). The [`overrides`](#overrides) key is defined below.

All comments support a `config.active` key: `Boolean` | `(modulePath, importPath) => Boolean`. This is used to enable or disable the comment.

Here is an example of using `config` to customize comment behavior:

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'magic-comments-loader',
        options: {
          webpackChunkName: {
            config: {
              basename: true
            }
          },
          webpackMode: {
            config: {
              mode: 'lazy-once'
            }
          },
          webpackInclude: {
            config: {
              include: (modulePath, importPath) => {
                if (/locales\/\${language}/.test(importPath)) {
                  return /\.json$/
                }
              }
            }
          }
        }
      }
    }
  ]
}
```

### Overrides

You can also override the configuration passed in the `config` key by using `overrides`. It is an array of objects that look like:

```js
overrides: [
 {
   files: ['src/**/*.js'],
   config: {
     active: true,
     mode: (modulePath, importPath) => {
       if (/eager/.test(importPath)) {
         return 'eager'
       }
     }
   }
 }
]
```

Here's a more complete example using `config` and `overrides` to customize how comments are applied:

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'magic-comments-loader',
        options: {
          verbose: true,
          webpackChunkName: {
            config: {
              basename: false
            },
            overrides: [
              {
                files: 'src/unique/**/*.js',
                config: {
                  basename: true
                }
              },
              {
                files: 'src/off/**/*.js',
                config: {
                  active: false
                }
              }
            ]
          },
          webpackPrefetch: [
            'src/prefetch/**/*.js',
            '!src/prefetch/skip/**/*.js'
          ],
          webpackMode: {
            config: {
              mode: 'lazy'
            },
            overrides: [
              {
                files: 'src/noMode/**/*.js',
                config: {
                  active: false
                }
              },
              {
                files: [
                  'src/**/*.js',
                  '!src/weak/**/*.js'
                ],
                config: {
                  mode: 'eager'
                }
              }
            ]
          }
        }
      }
    }
  ]
}
```

## Options

These are the options that can be configured under the loader `options`. When using comments with a [`config`](#with-config-options) key, you may also specify [`overrides`](#overrides).

* `verbose`: Boolean. Prints console statements of the module filepath and updated `import()` during the webpack build. Useful for debugging your custom configurations.
* `match`: `String(module|import)`. Sets how globs are matched, either the module file path or the `import()` path. Defaults to `'module'`.
* `webpackChunkName`
  * `true`: Adds `webpackChunkName` comments to **all** dynamic imports. This is the default.
  * `false`: Disables adding the `webpackChunkName` comment globally.
  * `['/src/**/*.js']`: Adds the comment when the glob(s) match a path from a `match` path.
  * `Function`: `(modulePath, importPath) => String(<chunk name>)`. Returning `false` does not add the comment.
  * `config.active`: Boolean | `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
  * `config.basename`: Boolean. Use only the basename from the import path as the chunk name. Relative imports may result in name collisions. Use in areas where you know the basenames are unique.
* [`webpackPreload`](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)
  * `true`: Adds `webpackPreload` comments to **all** dynamic imports.
  * `false`: Disables adding the `webpackPreload` comment globally. This is the default.
  * `['/src/**/*.js']`: Adds the comment with a value of `true` when the glob(s) match a path from a `match` path.
  * `Function`: `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
  * `config.active`: Boolean | `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
* [`webpackPrefetch`](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)
  * `true`: Adds `webpackPrefetch` comments to **all** dynamic imports.
  * `false`: Disables adding the `webpackPrefetch` comment globally. This is the default.
  * `['/src/**/*.js']`: Adds the comment with a value of `true` when the glob(s) match a path from a `match` path.
  * `Function`: `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
  * `config.active`: Boolean | `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
* `webpackIgnore`
  * `true`: Adds `webpackIgnore` comments to **all** dynamic imports. **You don't want to do this**.
  * `false`: Disables adding the `webpackIgnore` comment globally. This is the default.
  * `['/src/**/*.js']`: Adds the comment with a value of `true` when the glob(s) match a path from a `match` path.
  * `Function`: `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
  * `config.active`: Boolean | `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
* `webpackMode`
  * `true`: Adds `webpackMode` comments to **all** dynamic imports using `lazy`.
  * `false`: Disables adding the comment globally. This is the default.
  * `String(lazy|lazy-once|eager|weak)`: Adds the comment to **all** dynamic imports using the provided value.
  * `Function`: `(modulePath, importPath) => String(lazy|lazy-once|eager|weak)`. Return falsy value to skip.
  * `config.active`: Boolean | `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
  * `config.mode`: `String(lazy|lazy-once|eager|weak)` | `(modulePath, importPath) => String(lazy|lazy-once|eager|weak)`. Return falsy value to skip.
* `webpackExports`
  * `Function`: `(modulePath, importPath) => [String(<module names|default>)]`. Return falsy value to skip.
  * `config.active`: Boolean | `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
  * `config.exports`: `(modulePath, importPath) => [String(<module names|default>)]`. Return falsy value to skip.
* `webpackInclude`
  * `Function`: `(modulePath, importPath) => RegExp`. Return falsy value to skip.
  * `config.active`: Boolean | `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
  * `config.include`: `(modulePath, importPath) => RegExp`. Return falsy value to skip.
* `webpackExclude`
  * `Function`: `(modulePath, importPath) => RegExp`. Return falsy value to skip.
  * `config.active`: Boolean | `(modulePath, importPath) => Boolean`. Returning `false` does not add the comment.
  * `config.exclude`: `(modulePath, importPath) => RegExp`. Return falsy value to skip.
