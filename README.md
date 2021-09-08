# magic-comments-loader

Adds [magic coments](https://webpack.js.org/api/module-methods/#magic-comments) to your dynamic import statements.

**NOTE**: This loader ignores dynamic imports that already include comments of any kind.

Magic comments supported:
* `webpackChunkName`
* `webpackMode`
* `webpackIgnore`


## Usage

First `npm install magic-comments-loader`.

### Configuration

Add this inside your `webpack.config.js`.

#### Without options

Adds `webpackChunkName` to all dynamic imports (same as `webpackChunkName: true` when using options).
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

#### With options

When using the loaders `options` configure the magic comments by using their name as a key in the options object. You can provide a simple value to take on default behavior of the comment.

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
          webpackIgnore: 'src/ignore/**/*.js'
        }
      }
    }
  ]
}
```

For more control you can provide an object literal with futher configuration options specific
to each comment type. All comment types have a configuration option of `active` which is a boolean to enable
or disable the addition of the magic comment. When using an object literal the configuration must be passed under the `config` key.

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
            basename: true
          },
          webpackMode: {
            mode: 'lazy-once'
          },
          webpackIgnore: {
            active: false
          }
        }
      }
    }
  ]
}
```

You can also override the configuration passed in the `config` key by using the `overrides` key, which is an array of objects that look like:

```js
overrides: [
 {
   // Array of globs or a specific file (can be a string too)
   // Uses micromatch to compare the module filepath to the provided string
   files: ['src/**/*.js', '!/src/skip/**/*.js']
   // Other configuration keys for the comment type can go here too
   config: {
     active: false
   }
 }
]
```

Here's a more complete example using comment `config` and `overrides`:

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

### Magic Comments

With loader options configured like

```js
  {
    loader: 'magic-comments-loader',
    options: {
      webpackChunkName: true,
      webpackMode: 'lazy'
    }
  }
```

an import statement like

```js
const dynamicModule = await import('./path/to/some/module')
```

becomes

```js
const dynamicModule = await import(/* webpackChunkName: "path-to-some-module", webpackMode: "lazy" */ './path/to/some/module')
```

### Options

These are the options that can be configured under the loader `options`.

* `verbose`: Prints console statements of the updated `import()`s per module filepath during the webpack build. Useful for debugging your custom configurations.
* `webpackChunkName`
  * `true`: Adds `webpackChunkName` comments to **all** dynamic imports using the full path to the imported module to construct the name, so `import('path/to/module')` becomes `import(/* webpackChunkName: "path-to-module" */ 'path/to/module')`. This is the default.
  * `false`: Disables adding the `webpackChunkName` comment globally.
  * `config.active`: Boolean to enable/disable the comment.
  * `config.basename`: Boolean to use only the basename from the import path as the chunk name. Some relative path imports may end up with the same basename depsite importing different modules. Use in areas where you know the basenames are unique.
* `webpackMode`
  * `true`: Adds `webpackMode` comments to **all** dynamic imports using `lazy` so `import('path/to/module')` becomes `import(/* webpackMode: "lazy" */ 'path/to/module')`.
  * `false`: Disables adding the `webpackChunkName` comment globally. This is the default.
  * `config.active`: Boolean to enable/disable the comment.
  * `config.mode`: String to set the mode. `lazy`, `lazy-once`, `eager`, or `weak`.
* `webpackIgnore`
  * `true`: Adds `webpackIgnore` comments to **all** dynamic imports `true` so `import('path/to/module')` becomes `import(/* webpackIgnore: true */ 'path/to/module')`.
  * `false`: Disables adding the `webpackIgnore` comment globally. This is the default.
  * `some/glob/**/*.js`|`['/some/globs/**/*.js']`: Adds the comment with a value of `true` to all module filepaths that match the string or array of strings.
  * `config.active`: Boolean to enable/disable the comment.
