# magic-comments-loader

Adds [magic coments](https://webpack.js.org/api/module-methods/#magic-comments) to your dynamic import statements. Currently only supports `webpackChunkName` and `webpackMode`.

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
          webpackChunkName: true
          webpackMode: 'lazy'
        }
      }
    }
  ]
}
```

For more control you can provide an object literal with futher configuration options specific
to each comment type. All comment types have a configuration option of `active` which is a boolean to enable
or disable the addition of the magic comment. When using an object literal the configuration must be passed under the `config` key.

You can also override the configuration passed in the `config` key by file location when using the `overrides` key, which is an array of objects that look like:

```
overrides: [
 {
   files: ['src/**/*.js', '!/src/skip/**/*.js'] // Uses micromatch,
   config: {
     // Other configuration keys for the comment type can go here too
     active: false
   }
 }
]
```

Here's a more complete example:

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

With loader options configured like:

```js
  {
    loader: 'magic-comments-loader',
    options: {
      webpackChunkName: true,
      webpackMode: 'lazy'
    }
  }
```

An import statement like:

```js
const dynamicModule = await import('./path/to/some/module')
```

Becomes:

```js
const dynamicModule = await import(/* webpackChunkName: "path-to-some-module", webpackMode: "lazy" */ './path/to/some/module')
```
