# [`magic-comments-loader`](https://www.npmjs.com/package/magic-comments-loader) 🪄

![CI](https://github.com/morganney/magic-comments-loader/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/magic-comments-loader/branch/master/graph/badge.svg?token=1DWQL43B8V)](https://codecov.io/gh/morganney/magic-comments-loader)

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
      test: /\.[j]sx?$/,
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

Most loader options can be defined with a [`CommentConfig`](#commentconfig) object to support overrides and  suboptions ([`CommentOptions`](#commentoptions)). Options that support globs use [`micromatch`](https://github.com/micromatch/micromatch) for pattern matching.

* [`verbose`](#verbose)
* [`mode`](#mode)
* [`match`](#match)
* [`webpackChunkName`](#webpackchunkname)
* [`webpackFetchPriority`](#webpackfetchpriority)
* [`webpackMode`](#webpackmode)
* [`webpackPrefetch`](#webpackprefetch)
* [`webpackPreload`](#webpackpreload)
* [`webpackInclude`](#webpackinclude)
* [`webpackExclude`](#webpackexclude)
* [`webpackExports`](#webpackexports)
* [`webpackIgnore`](#webpackignore)

### `CommentConfig`
To allow configuration overrides based on module or import paths, or to support comment options that extend functionality, all options except `verbose`, and `match`, can be defined with an object using the following interface:

```ts
interface CommentConfig {
  config: CommentOptions;
  overrides?: Array<{
    files: string | string[];
    config: CommentOptions;
  }>;
}
```

#### `CommentOptions`

The exact `CommentOptions` shape defining `config` is determined by the loader option it is associated with, but the interface always extends `CommentOptionsBase`:
```ts
interface CommentOptions extends CommentOptionsBase {
  // In general, a "falsy" value disables the comment.
  [option: string]: boolean | string | Function | RegExp | undefined;
}

interface CommentOptionsBase {
  // Can be used to turn a magic comment on or off.
  active?: boolean | ((modulePath: string, importPath: string) => boolean)
}
```

You can skip to the [overrides example](#overrides) to get a better sense of how this all works.

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

### `webpackChunkName`

**type**
```ts
boolean
| string
| string[]
| ((modulePath: string, importPath: string) => any)
| CommentConfig
```
**default** `true`

Adds `webpackChunkName` magic comments. This option is enabled by default when registering the loader in your webpack configuration.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  basename: boolean;
  active: boolean | ((modulePath: string, importPath: string) => boolean);
}
```

Possible values:
* `true` - Adds `webpackChunkName` comments to **all** dynamic imports using the derived path from the import specifier in kebab-case as the chunk name. This is the default.
* `false` - Disables adding the `webpackChunkName` comment globally.
* `string | string[]` - When the glob(s) match a path from a [`match`](#match) path, a `webpackChunkName` comment is added using the derived path from the import specifier in kebab-case as the chunk name.
* `(modulePath: string, importPath: string) => any` - Return a string to be used as the chunk name. Returning a falsy value will skip adding the comment.
* `config.basename`:
  * `true` - Use only the [basename](https://nodejs.org/api/path.html#pathbasenamepath-suffix) from the import specifier as the chunk name. Relative imports may result in name collisions. Use in areas where you know the basenames are unique.
  * `false` - Use the full derived path from the import specifier in kebab-case as the chunk name, same as the default behavior.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackFetchPriority`

**type**
```ts
boolean
| 'high' | 'low' | 'auto'
| ((modulePath: string, importPath: string) => any)
| CommentConfig
```
**default** None

Adds `webpackFetchPriority` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  fetchPriority: 'high' | 'low' | 'auto' | ((modulePath: string, importPath: string) => any);
  active: boolean | ((modulePath: string, importPath: string) => boolean);
}
```

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackFetchPriority` magic comments to **all** dynamic imports with the default value of `'auto'`.
* `string` - Add `webpackFetchPriority` magic comments to **all** dynamic imports with the provided string value as the priority. If the string is not `'high'`, `'low'`, or `'auto'` the comment will **not** be added.
* `(modulePath: string, importPath: string) => any` - Return a string to be used as the priority. Returning a falsy value or an unsupported string will **not** add the comment.
* `config.fetchPriority`:
  * `'high' | 'low' | 'auto'` - Sets the fetch priority to the provided value when adding the comment.
  * `(modulePath: string, importPath: string) => any` - Same as using a function for the loader option.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackMode`

**type**
```ts
boolean
| 'lazy' | 'lazy-once' | 'eager' | 'weak'
| ((modulePath: string, importPath: string) => any)
| CommentConfig
```
**default** None

Adds `webpackMode` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  mode: 'lazy' | 'lazy-once' | 'eager' | 'weak' | ((modulePath: string, importPath: string) => any);
  active: boolean | ((modulePath: string, importPath: string) => boolean);
}
```

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackMode` magic comments to **all** dynamic imports with the default value of `'lazy'`.
* `string` - Add `webpackMode` magic comments to **all** dynamic imports with the provided string value as the mode. If the string is not `'lazy'`, `'lazy-once'`, `'eager'`, or `'weak'` the comment will **not** be added.
* `(modulePath: string, importPath: string) => any` - Return a string to be used as the mode. Returning a falsy value or an unsupported string will **not** add the comment.
* `config.mode`:
  * `'lazy' | 'lazy-once' | 'eager' | 'weak'` - Sets the chunk loading mode to the provided value when adding the comment.
  * `(modulePath: string, importPath: string) => any` - Same as using a function for the loader option.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### [`webpackPrefetch`](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)

**type**
```ts
boolean
| string
| string[]
| ((modulePath: string, importPath: string) => boolean)
| CommentConfig
```
**default** None

Adds `webpackPrefetch` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{ active: boolean | ((modulePath: string, importPath: string) => boolean); }
```

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackPrefetch` magic comments with a value of `true` to **all** dynamic imports. 
* `string | string[]` - Add `webpackPrefetch` comment with a value of `true` when the glob(s) match a path from a [`match`](#match) path.
* `(modulePath: string, importPath: string) => boolean` - Returning `false` will disable adding the comment, otherwise it will be added.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### [`webpackPreload`](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)

**type**
```ts
boolean
| string
| string[]
| ((modulePath: string, importPath: string) => boolean)
| CommentConfig
```
**default** None

Adds `webpackPreload` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{ active: boolean | ((modulePath: string, importPath: string) => boolean); }
```

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackPreload` magic comments with a value of `true` to **all** dynamic imports. 
* `string | string[]` - Add `webpackPreload` comment with a value of `true` when the glob(s) match a path from a [`match`](#match) path.
* `(modulePath: string, importPath: string) => boolean` - Returning `false` will disable adding the comment, otherwise it will be added.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackInclude`

**type**
```ts
RegExp
| ((modulePath: string, importPath: string) => RegExp)
| CommentConfig
```
**default** None

Adds `webpackInclude` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  include: (modulePath: string, importPath: string) => RegExp;
  active: boolean | ((modulePath: string, importPath: string) => boolean);
}
```

Possible values:
*  `RegExp` - Adds a `webpackInclude` comment to **all** dynamic imports using the provided regular expression.
*  `(modulePath: string, importPath: string) => RegExp` - Adds a `webpackInclude` comment using the provided regular expression. Returning anything other than a regular expression does **not** add the comment.
*  `config.include`:
   * `RegExp` - Adds a `webpackInclude` comment to **all** dynamic imports, or only those matching a path from the [`match`](#match) path if using overrides.
   * `(modulePath: string, importPath: string) => RegExp` - Same as using a function in the loader option.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackExclude`

**type**
```ts
RegExp
| ((modulePath: string, importPath: string) => RegExp)
| CommentConfig
```
**default** None

Adds `webpackExclude` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  exclude: (modulePath: string, importPath: string) => RegExp;
  active: boolean | ((modulePath: string, importPath: string) => boolean);
}
```

Possible values:
*  `RegExp` - Adds a `webpackExclude` comment to **all** dynamic imports using the provided regular expression.
*  `(modulePath: string, importPath: string) => RegExp` - Adds a `webpackExclude` comment using the provided regular expression. Returning anything other than a regular expression does **not** add the comment.
*  `config.exclude`:
   * `RegExp` - Adds a `webpackExclude` comment to **all** dynamic imports, or only those matching a path from the [`match`](#match) path if using overrides.
   * `(modulePath: string, importPath: string) => RegExp` - Same as using a function in the loader option.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackExports`

**type**
```ts
((modulePath: string, importPath: string) => string[])
| CommentConfig
```
**default** None

Adds `webpackExports` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  exports: (modulePath: string, importPath: string) => string[];
  active: boolean | ((modulePath: string, importPath: string) => boolean);
}
```

Possible values:
* `(modulePath: string, importPath: string) => string[]` - Adds a `webpackExports` comment using the strings in the returned array as the export names. Returning anything other than an array will **not** add the comment.
* `config.exports`:
  * `(modulePath: string, importPath: string) => string[]` - Same as using a function in the loader option.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.


### `webpackIgnore`

**type**
```ts
boolean
| string
| string[]
| ((modulePath: string, importPath: string) => boolean)
| CommentConfig
```
**default** None

Adds `webpackIgnore` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{ active: boolean | ((modulePath: string, importPath: string) => boolean); }
```

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackIgnore` magic comments with a value of `true` to **all** dynamic imports. Effectively, opt-out of webpack code-splitting for dynamic imports. 
* `string | string[]` - Add `webpackIgnore` comment with a value of `true` when the glob(s) match a path from a [`match`](#match) path.
* `(modulePath: string, importPath: string) => boolean` - Returning `false` will **not** add the comment, otherwise it will be added.
* `config.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

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
          webpackChunkName: ['src/**/*.js']
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

Finally, using a [`CommentConfig`](#commentconfig) object you can change the chunk name to the import specifier's basename (instead of the full hyphenated path). This could potentially result in name collisions, so be mindful of import specifiers when activating. You could also achieve the same thing by using a function instead of `config.basename`.

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
            config: {
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

Most of the magic comments can be configured similarly, and **all** support configuration as a function with the signature `(modulePath: string, importPath: string) => any`, albeit the return type is checked at runtime for compliance with the expected values. Check out the loader [options](#options) for more details.

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

When using a [`CommentConfig`](#commentconfig) object, you can override the configuration passed in the `config` key by defining `overrides`. It is an array of objects that look like:

```ts
{
  files: string | string[];
  config: CommentOptions;
}
```

The `files` and `config` keys are both required, where the former is a glob string, or an array thereof, and the latter is the associated magic comment's [`CommentOptions`](#commentoptions).

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
            config: {
              mode: 'lazy'
            },
            overrides: [
              {
                files: ['eager/**/*.js'],
                config: {
                  mode: 'eager'
                }
              },
              {
                files: ['locales/**/*.json'],
                config: {
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
