# Fledermaus: Batman’s toolbelt for static site generation

[![Build Status](https://travis-ci.org/sapegin/fledermaus.svg)](https://travis-ci.org/sapegin/fledermaus)

Infinitely extensible simple ES6 static site generator.

Based on [ECT](http://ectjs.com/), [Remark](http://remark.js.org/), [Richtypo](https://github.com/sapegin/richtypo.js), [Highlight.js](https://highlightjs.org/) and [Intl MessageFormat](https://github.com/yahoo/intl-messageformat).

## Installation

```bash
$ npm install --save-dev fledermaus
```

Examples below are written in ES6, so you need Babel to run them (but Babel is not required to use Fledermaus):

```bash
$ npm install --save-dev babel-cli babel-preset-node5
```

I also recommend to use http-server (or [tamia-build](https://github.com/tamiadev/tamia-build)) to preview your site locally:

```bash
$ npm install --save-dev http-server
```

And chokidar to recompile site on changes in templates and sources:

```bash
$ npm install --save-dev chokidar-cli
```

Your `package.json` should look like this:

```json
{
  "name": "example.com",
  "version": "1.0.0",
  "private": true,
  "devDependencies": {
    "babel-cli": "~6.4.0",
    "babel-preset-node5": "~10.7.0",
    "chokidar-cli": "~1.2.0",
    "http-server": "~0.8.5",
    "fledermaus": "~4.1.0"
  },
  "scripts": {
    "start": "npm run server & npm run watch",
    "build": "node lib",
    "build:watch": "chokidar templates source -c 'node lib'",
    "compile": "babel -d lib src",
    "compile:watch": "babel --watch -d lib src",
    "server": "http-server public -p 4242 -o"
  }
}
```

Now you can use `npm run build` to build your site and `npm start` to run a local server. You’ll need to run `npm run compile` every time you change file in the `lib` folder.

Your `.babelrc` should look like this:

```json
{
  "presets": [
    "node5"
  ]
}
```

## Recommended folder structure

```
.
├── src           # Generator code
│   └── index.js
├── config        # Configs
│   └── base.yml  # Base config
│   └── en.yml    # Language specific configs
│   └── ru.yml
├── source        # Markdown sources
├── templates     # ECT templates
├── public        # Generated HTML files
```

## Examples

### Simple static site

`src/index.js`:

```javascript
import {
  start,
  loadConfig,
  loadSourceFiles,
  generatePages,
  savePages,
  createMarkdownRenderer,
  createTemplateRenderer,
  helpers
} from 'fledermaus';

start('Building the site...');

let config = loadConfig('config');
let options = config.base;

let renderMarkdown = createMarkdownRenderer();
let renderTemplate = createTemplateRenderer({
  root: options.templatesFolder
});

let documents = loadSourceFiles(options.sourceFolder, options.sourceTypes, {
  renderers: {
    md: renderMarkdown
  }
});

let pages = generatePages(documents, config, helpers, {ect: renderTemplate});

savePages(pages, options.publicFolder);
```

`config/base.yml`:

```yaml
sourceFolder: source
sourceTypes:
  - md
  - html
templatesFolder: templates
assetsFolder: public
publicFolder: public

lang: en
url: http://sapegin.me

title: Artem Sapegin’s Home Page
```

You can find examples of templates and source files here: https://github.com/sapegin/sapegin.me.

### Multilingual blog

* Two languages;
* pagination;
* cut;
* tags;

`src/index.js`:

```javascript
import {
  start,
  loadConfig,
  loadSourceFiles,
  generatePages,
  savePages,
  paginate,
  orderDocuments,
  groupDocuments,
  createMarkdownRenderer,
  createTemplateRenderer,
  helpers
} from 'fledermaus';

start('Building the blog...');

let config = loadConfig('config');
let options = config.base;

// Remove language (en or ru) from a URL
let removeLang = url => url.replace(/(en|ru)\//, '');

let renderMarkdown = createMarkdownRenderer();
let renderTemplate = createTemplateRenderer({
  root: options.templatesFolder
});

let documents = loadSourceFiles(options.sourceFolder, options.sourceTypes, {
  renderers: {
    md: renderMarkdown
  },
  // Custom front matter field parsers
  fieldParsers: {
    // Save `date` field as a timestamp
    timestamp: (timestamp, attrs) => Date.parse(attrs.date),
    // Convert `date` field to a Date object
    date: (date, attrs) => new Date(Date.parse(date))
  },
  // Cut separator
  cutTag: options.cutTag
});

// Oder by date, newest first
documents = orderDocuments(documents, ['-timestamp']);

// Group posts by language
let documentsByLanguage = groupDocuments(documents, 'lang');
let languages = Object.keys(documentsByLanguage);

documents = languages.reduce((result, lang) => {
  let docs = documentsByLanguage[lang];
  let newDocs = [];

  // Translations
  // Append all posts with a field indicating whether this post has a translation
  // (post with the same URL in another language)
  let translationLang = lang === 'ru' ? 'en' : 'ru';
  let hasTranslation = (url) => {
    url = removeLang(url);
    return !!documentsByLanguage[translationLang].find(doc => removeLang(doc.url) === url); // FIXME
  }
  docs = docs.map((doc) => {
    return {
      ...doc,
      translation: hasTranslation(doc.url)
    };
  });

  // Pagination
  newDocs.push(...paginate(docs, {
    sourcePathPrefix: lang,
    urlPrefix: `/${lang}/`,
    documentsPerPage: options.postsPerPage,
    layout: 'index',
    index: true,
    extra: {
      lang
    }
  }));

  // Tags
  let postsByTag = groupDocuments(docs, 'tags');
  let tags = Object.keys(postsByTag);
  newDocs.push(...tags.reduce((tagsResult, tag) => {
    let tagDocs = postsByTag[tag];
    let tagsNewDocs = paginate(tagDocs, {
      sourcePathPrefix: `${lang}/tags/${tag}`,
      urlPrefix: `/${lang}/tags/${tag}`,
      documentsPerPage: options.postsPerPage,
      layout: 'tag',
      extra: {
        lang,
        tag
      }
    });
    return [...tagsResult, ...tagsNewDocs];
  }, []));

  return [...result, ...docs, ...newDocs];
}, []);

let pages = generatePages(documents, config, helpers, {ect: renderTemplate});

savePages(pages, options.publicFolder);
```

`config/base.yml`:

```yaml
sourceFolder: source
sourceTypes:
  - md
  - html
templatesFolder: templates
assetsFolder: public
publicFolder: public
postsPerPage: 10
postsInFeed: 15
cutTag: <!-- cut -->
```

`config/en.yml`:

```yaml
url: http://blog.sapegin.me
title: Artem Sapegin’s Blog
description: 'Blog of a Berlin based font-end developer who works at Here, shoots photos and makes something awesome on the internet.'
author: Artem Sapegin
email: artem@sapegin.me
tagNames:
  css: CSS
  html: HTML
  javascript: JavaScript
  thoughts: Thoughts
  tools: Tools
```

You can find examples of templates and source files here: https://github.com/sapegin/blog.sapegin.me.

## Advanced Usage

### Custom helpers

`helpers.js`:

```js
import { cleanHtml } from 'fledermaus/lib/util';

// Page title
export function getPageTitle(suffix) {
  if (this.pageTitle) {
    return this.pageTitle;
  }
  if (this.title) {
    if (suffix === undefined) {
      suffix = ' — ' + this.option('title');
    }
    return cleanHtml(this.title) + (suffix || '');
  }
  else {
    return this.option('title');
  }
}
```

`src/index.js`:

```js
import {
  // ...
  helpers as defaultHelpers
} from 'fledermaus';
import * as customHelpers from './helpers';

// ...

let helpers = {...defaultHelpers, ...customHelpers};

// ...

let pages = generatePages(documents, config, helpers, {ect: renderTemplate});

// ...
```

Template:

```html
<title><%= @getPageTitle() %></title>
```

### Custom tags

`src/index.js`:

```js
import {
  // ...
  createMarkdownRenderer
} from 'fledermaus';
import { MarkdownRenderer } from 'fledermaus/lib/renderers/markdown';

let renderMarkdown = createMarkdownRenderer({
  customTags: {
    embed: ({ id, title }) => {
      return `
        <div class="embed">
          <div class="embed__content embed-${id}">
            <div class="embed-${id}-i" id="${id}"></div>
          </div>
          <div class="embed__description">${title}</div>
        </div>
      `;
    }
  }
});

// ...
```

Markdown source (on a separate line):

```html
<x-embed id="ironman" title="Use keys ← and →, mouse or thumbs and have the pleasure of Ivan’s sprites.">
```

### Tweaking Markdown renderering

`src/index.js`:

```javascript
import {
  // ...
  createMarkdownRenderer
} from 'fledermaus';
import visit from 'unist-util-visit';

function remarkScreenshot(processor) {
  return ast => visit(ast, 'paragraph', node => {
    // Screenshots: /images/mac__shipit.png or /images/win__shipit.png
    let child = node.children && node.children[0];
    if (child && child.type === 'image') {
     let m = child.url.match(/\/(\w+)__/);
      if (m) {
        node.children = null;
        node.type = 'html';
        node.value = `<div class="screenshot screenshot_${m[1]}"><img src="${child.url}" alt="${child.title || ''}"></div>`;
      }
    }
  });
}
let renderMarkdown = createMarkdownRenderer({
  plugins: [remarkScreenshot]
});
```

### Deploying to GitHub Pages

Install `gh-pages` module:

```bash
$ npm install --save-dev gh-pages
```

Add an npm script to your `package.json`:

```json
{
  "scripts": {
    "build": "node lib",
    "gh-pages": "gh-pages -d public",
    "deploy": "npm run build && npm run gh-pages"
  }
}
```

Now you can use `npm run deploy` to build and upload your site to GitHub Pages.

## Showcase

* [Artem Sapegin’s site](http://sapegin.me/) ([source](https://github.com/sapegin/sapegin.me))
* [Artem Sapegin’s blog](http://blog.sapegin.me/) ([source](https://github.com/sapegin/blog.sapegin.me))

## Changelog

The changelog can be found on the [Releases page](https://github.com/sapegin/fledermaus/releases).


## Author

* [Artem Sapegin](http://sapegin.me)

---

## License

The MIT License, see the included [License.md](License.md) file.
