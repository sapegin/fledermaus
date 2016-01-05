# sweet2: Batman’s toolbelt for static site generation

[![Build Status](https://travis-ci.org/sapegin/sweet2.svg)](https://travis-ci.org/sapegin/sweet2)

Infinitely extensibe simple ES6 static site generator.

## Installation

```bash
$ npm install --save-dev sweet2
```

Examples below are written in ES6 so you need Babel to run them (but Babel it’s not required to use sweet2):

```bash
$ npm install --save-dev babel-cli babel-preset-es2015 babel-preset-stage-2
```

I also recommend to use http-server to preview your site locally:

```bash
$ npm install --save-dev http-server
```

Your `package.json` should look like this:

```json
{
  "name": "example.com",
  "version": "1.0.0",
  "private": true,
  "devDependencies": {
    "babel": "~6.0.0",
    "http-server": "~0.8.5",
    "sweet2": "~2.0.0"
  },
  "scripts": {
    "build": "babel-node index.js",
    "start": "http-server public -p 4242 -o"
  }
}
```

Now you can use `npm run build` to build your site and `npm start` to run a local server.

And your `.babelrc` should look like this:

```json
{
  "presets": [
    "es2015",
    "stage-2"
  ]
}
```

## Recommended folder structure

```
.
├── index.js      # Generator code
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

`index.js`:

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
} from 'sweet2';

start('Building site...');

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

Examples of templates and source files [you can find here](https://github.com/sapegin/sapegin.me).

### Multilingual blog

* Two languages;
* pagination;
* cut;
* tags;

`index.js`:

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
} from 'sweet2';

start('Building blog...');

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
description: 'Blog of a Berlin based font-end developer who works at Here, shoot photos and make something awesome on the internet.'
author: Artem Sapegin
email: artem@sapegin.me
tagNames:
  css: CSS
  html: HTML
  javascript: JavaScript
  thoughts: Thoughts
  tools: Tools
```

Examples of templates and source files [you can find here](https://github.com/sapegin/blog.sapegin.me).

## Advanced Usage

### Custom helpers

`helpers.js`:

```js
import { cleanHtml } from 'sweet2/lib/util';

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

`index.js`:

```js
import {
  // ...
  helpers as defaultHelpers
} from 'sweet2';
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

`index.js`:

```js
import {
  // ...
  createMarkdownRenderer
} from 'sweet2';
import { MarkdownRenderer } from 'sweet2/lib/renderers/markdown';

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

### Markdown renderer tweaking

`index.js`:

```js
import {
  // ...
  createMarkdownRenderer
} from 'sweet2';
import { MarkdownRenderer } from 'sweet2/lib/renderers/markdown';

class CustomMarkdownRenderer extends MarkdownRenderer {
  // Screenshots: /images/mac__shipit.png or /images/win__shipit.png
  paragraph(text) {
    let m = text.match(/<img src="\/images\/(\w+)__/);
    if (m) {
      return `<div class="screenshot screenshot_${m[1]}">${text}</div>\n`;
    }
    return `<p>${text}</p>\n`;
  }
}

let renderMarkdown = createMarkdownRenderer({
  renderer: CustomMarkdownRenderer
});

// ...
```

## Showcase

* [Artem Sapegin’s site](http://sapegin.me/) ([source](https://github.com/sapegin/sapegin.me))
* [Artem Sapegin’s blog](http://blog.sapegin.me/) ([source](https://github.com/sapegin/blog.sapegin.me))

## Changelog

The changelog can be found in the [Changelog.md](Changelog.md) file.


## Author

* [Artem Sapegin](http://sapegin.me)

---

## License

The MIT License, see the included [License.md](License.md) file.
