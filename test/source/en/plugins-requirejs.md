---
layout: post
lang: en
title: 'Loading framework’s plugins with RequireJS'
date: Mar 27, 2015
tags:
  - javascript
---

In big project, you often use framework extensions or plugins: things that extend your framework’s namespace but do not export any modules themselves. For example I use Backbone and React with [Backbone.localStorage](https://github.com/jeromegn/Backbone.localStorage), [react.backbone](https://github.com/clayallsopp/react.backbone) and [my own React mixins](https://github.com/sapegin/kurush/blob/6f3ac4a38bada39a59cce0fce33d97f8b12c812c/web/app/util/react-extras.js).

I’m trying to find the best way to include such modules with RequireJS. Most of them can be used for polyfills too.

## Almighty copypasta

Just require everything in all modules.

```js
// mymodule.js
define(['backbone', 'react', 'backboneLocalStorage', 'reactBackbone', 'util/react-extras'], function(Backbone, React) {
    …
});
```

Pros:

* None.

Cons:

* Code repetition.
* Very hard to maintain.

## Main module

Require everything in the main module.

```js
// main.js
require(['router', 'backbone', 'backboneLocalStorage', 'reactBackbone', 'util/react-extras'], function(Router, Backbone) {
    …
});
```

Pros:

* Clean modules.
* All extensions in (almost) one place.

Cons:

* Difficult to test (tests don’t include main.js), so you need to require these modules for tests differently.

## Bootstrap module

Put all the extensions in a separate module and require it from your main module and from tests.

```js
// main.js
require(['bootstrap', 'router', 'backbone'], function(_, Router, Backbone) {
    …
});

// bootstrap.js
define([
    'backbone',
    'react',
    'backboneLocalStorage',
    'reactBackbone',
    'util/react-extras'
]);
```

Pros:

* All extensions in one place.
* Clean modules.

Cons:

* You need to require bootstrap from your main module and from every test.

## RequireJS bundles

Bundle is a special module, which you create with [the RequieJS optimizer](http://requirejs.org/docs/optimization.html). Any time you require one of the modules inside the bundle RequireJS will load the bundle instead.

```js
// config.js
require.config({
    bundles: {
        'backbone-bundle': ['backbone', 'backboneLocalStorage'],
        'react-bundle': ['react', 'reactBackbone', 'util/react-extras']
    }
    …
});
```

(I haven’t try this method myself because I think it’s overcomplicated but here’s a [good article](http://webroo.org/articles/2014-03-30/using-the-new-require-js-bundles-feature/) on how to make and use bundles.)

Pros:

* Clean modules.
* No need to do anything special for tests.

Cons:

* You need to create and maintain bundles.

## Wrappers

Create a separate module that requires an original framework with all needed extensions and returns framework back. Do it for all your frameworks that you want to extend.

```js
// config.js
require.config({
    paths: {
        // Rename original framework
        reactOriginal: 'bower_components/react…',
        // require('react') will load our wrapper module
        react: 'react-with-extras'
    }
    …
});

// react-with-extras.js
define(['reactOriginal', 'util/react-extras'], function(React) {
    return React;
});
```

Pros:

* Clean modules.
* No need to do anything special for tests.

Cons:

* A bit complicated.

## Conclusion

I don’t like any of these techniques very much and I hope I’ve just missed the best one. Tell me if you know it.
