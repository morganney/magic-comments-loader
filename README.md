# [`magic-comments-loader`](https://www.npmjs.com/package/magic-comments-loader) 🪄

![CI](https://github.com/morganney/magic-comments-loader/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/magic-comments-loader/branch/main/graph/badge.svg?token=1DWQL43B8V)](https://codecov.io/gh/morganney/magic-comments-loader)
[![NPM version](https://img.shields.io/npm/v/magic-comments-loader.svg)](https://www.npmjs.com/package/magic-comments-loader)

Keep your source code clean, add [magic comments](https://webpack.js.org/api/module-methods/#magic-comments) to your dynamic `import()` expressions at build time.

## Getting Started

First install `magic-comments-loader`:

```
npm install magic-comments-loader
```

Next add the loader to your `webpack.config.js` file:

```js
module: {
  rules: [
    {
      test: /\.jsx?$/,
      use: ['magic-comments-loader']
    }
  ]
}
```

Then given a **file.js** with the following import:

```js
const dynamicModule = await import('./path/to/module.js')
```

While running `webpack` the dynamic import inside **file.js** becomes:

```js
const dynamicModule = await import(/* webpackChunkName: "path-to-module" */ './path/to/module.js')
```

The `webpackChunkName` comment is added by default when registering the loader. See the supported [options](#options) to learn about configuring other magic comments.

## Options

* [`verbose`](#verbose)
* [`mode`](#mode)
* [`match`](#match)
* [`comments`](#comments)
* `[magicCommentName: string]: MagicCommentValue` see `magic-comments` [options](https://github.com/morganney/magic-comments#options) for details

### `verbose`
**type**
```ts
boolean
```
**default** `false`

Prints console statements of the module filepath and updated `import()` during the webpack build. Useful for debugging.

### `mode`
**type**
```ts
'parser' | 'regexp'
```
**default** `'parser'`

Sets how the loader finds dynamic import expressions in your source code, either using an [ECMAScript parser](https://github.com/acornjs/acorn), or a regular expression. Your mileage may vary when using `'regexp'`.

### `match`
**type**
```ts
'module' | 'import'
```
**default** `'module'`

Sets how globs are matched, either the module file path, or the `import()` specifier.

### `comments`
**type**
```ts
'ignore' | 'prepend' | 'append' | 'replace'
| (cmts: Array<{ start: number; end: number; text: string }>, magicComment: string) => string
```
**default** `'ignore'`

_Note, this option is only applied when `mode` is `parser`._

_Note, this option only considers block comments that precede the dynamic imports specifier, and any comments coming after are ignored and left intact._

Sets how dynamic imports with block comments are handled. If `ignore` is used, then it will be skipped and no magic comments from your configuration will be applied. If `replace` is used, then all found comments will be replaced with the magic comments. `append` and `prepend` add the magic comments after, or before the found comments, respectively.

When a function is used it will be passed the found comments, and the magic comment string that is to be applied. The return value has the same effect as `replace`. There is an [example of using a function](https://github.com/morganney/magic-comments-loader/blob/main/__tests__/loader.spec.js#L1137-L1154) in the loader specification.

## Examples

Below are examples for some of the supported magic comments. Consult the [loader specification](https://github.com/morganney/magic-comments-loader/blob/main/__tests__/loader.spec.js) for a comprehensive usage example.

### webpackChunkName

Add `webpackChunkName` magic comments to dynamic imports matching the provided glob(s), using the import path in _kebab-case_ as the default chunk name. Glob matching is done using [micromatch](https://github.com/micromatch/micromatch).

**config**
```js
module: {
  rules: [
    {
      test: /\.[jt]sx?$/,
      use: {
        loader: 'magic-comments-loader',
        options: {
          webpackChunkName: ['**/src/**/*.js']
        }
      }
    }
  ]
}
```
**src**
```js
import('./folder/module.js')
```
**build**
```js
import(/* webpackChunkName: "folder-module" */ './folder/module.js')
```

To define a custom chunk name, use a function as the option value. Returning nothing, or a falsy value skips adding the comment.

**config**
```js
module: {
  rules: [
    {
      test: /\.[jt]sx?$/,
      use: {
        loader: 'magic-comments-loader',
        options: {
          webpackChunkName: (modulePath, importPath) => {
            if (importPath.endsWith('module.js')) {
              return 'custom-chunk-name'
            }
          }
        }
      }
    }
  ]
}
```

**src**
```js
import('./folder/module.js')
```

**build**
```js
import(/* webpackChunkName: "custom-chunk-name" */ './folder/module.js')
```

Finally, using a [`CommentConfig`](https://github.com/morganney/magic-comments#commentconfig) object you can change the chunk name to the import specifier's basename (instead of the full hyphenated path). This could potentially result in name collisions, so be mindful of import specifiers when activating. You could also achieve the same thing by using a function instead of `options.basename`.

**config**
```js
module: {
  rules: [
    {
      test: /\.[jt]sx?$/,
      use: {
        loader: 'magic-comments-loader',
        options: {
          webpackChunkName: {
            options: {
              basename: true
            }
          }
        }
      }
    }
  ]
}
```

**src**
```js
import('./folder/module.js')
```

**build**
```js
import(/* webpackChunkName: "module" */ './folder/module.js')
```

Most of the magic comments can be configured similarly, and **all** support configuration as a function with the signature `(modulePath: string, importPath: string) => any`, albeit the return type is checked at runtime for compliance with the expected values. Check out the [options](https://github.com/morganney/magic-comments#options) for `magic-comments` more details.

### Multiple

You can add multiple magic comments.

**config**
```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: {
        loader: 'magic-comments-loader',
        options: {
          webpackChunkName: true,
          webpackMode: 'lazy',
          webpackFetchPriority: (modulePath, importPath) => {
            if (importPath.includes('priority')) {
              return 'high'
            }
          }
        }
      }
    }
  ]
}
```

**src**
```js
import('./priority/module.js')
```

**build**
```js
import(/* webpackChunkName: "priority-module", webpackMode: "lazy", webpackFetchPriority: "high" */ './priority/module.js')
```

### Overrides

When using a [`CommentConfig`](https://github.com/morganney/magic-comments#commentconfig) object, you can override the configuration passed in the `options` key by defining `overrides`. It is an array of objects that look like:

```ts
Array<{
  files: string | string[];
  options: CommentOptions;
}>
```

The `files` and `options` keys are both required, where the former is a glob string, or an array thereof, and the latter is the associated magic comment's [`CommentOptions`](https://github.com/morganney/magic-comments#commentoptions).

Here's a more complete example of how overrides can be applied:

**config**
```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: {
        loader: 'magic-comments-loader',
        options: {
          match: 'import', // Now provided globs match against the import specifier
          webpackChunkName: '*.json',
          webpackMode: {
            options: {
              mode: 'lazy'
            },
            overrides: [
              {
                files: ['**/eager/**/*.js'],
                options: {
                  mode: 'eager'
                }
              },
              {
                files: ['**/locales/**/*.json'],
                options: {
                  mode: 'lazy-once'
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

**src**
```js
const lang = 'es'
import('./folder/module.js')
import('./eager/module.js')
import(`./locales/${lang}.json`)
```

**build**
```js
const lang = 'es'
import(/* webpackMode: "lazy" */ './folder/module.js')
import(/* webpackMode: "eager" */ './eager/module.js')
import(/* webpackChunkName: "locales-[request]", webpackMode: "lazy-once" */ `./locales/${lang}.json`)
```

You can also see the [example for overrides in `magic-comments`](https://github.com/morganney/magic-comments#overrides).

### TypeScript

When using TypeScript or experimental ECMAScript features <= [stage 3](https://tc39.es/process-document/), i.e. non spec compliant, you must chain the appropriate loaders with `magic-comments-loader` coming after.

For example, if your project source code is written in TypeScript, and you use `babel-loader` to transpile and remove type annotations via `@babel/preset-typescript`, while `tsc` is used for type-checking only, chain loaders like this:

**config**
```js
module: {
  rules: [
    {
      test: /\.[jt]sx?$/,
      // Webpack loader chains are processed in reverse order, i.e. last comes first.
      use: [
        'magic-comments-loader',
        'babel-loader'
      ]
    }
  ]
}
```

You would configure `ts-loader` similarly, or any other loader that transpiles your source code into spec compliant ECMAScript.
