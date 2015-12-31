# sweet2: Batman’s toolbelt for static site generation

[![Build Status](https://travis-ci.org/sapegin/sweet2.svg)](https://travis-ci.org/sapegin/sweet2)

Infinitely extensibe simple ES6 static site generator.

## Installation

```bash
$ npm install --save-dev sweet2
```

## The gist

### Simple static site.

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

`package.json`:

```json
{
  "name": "sapegin.me",
  "version": "0.0.0",
  "private": true,
  "devDependencies": {
    "babel": "~5.8.23",
    "http-server": "~0.8.5",
    "sweet2": "~1.0.0"
  },
  "scripts": {
    "build": "babel-node index.js",
    "start": "http-server public -p 4242 -o"
  }
}
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
