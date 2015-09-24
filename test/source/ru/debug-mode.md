---
layout: post
lang: ru
title: Условная компиляция (отладочная версия) JavaScript и Stylus с помощью Grunt
date: "Mar 6, 2013"
disqus_identifier: "debug-mode"
tags: 
  - javascript
  - stylus
  - html
  - tools

---

Почти в любом проекте есть какой-то код, который используется только для отладки, и было бы удобно, если бы такой код автоматически удалялся при публикации.

Отладочный режим будет включаться при запуске [Гранта](http://nano.sapegin.ru/all/grunt-0-4) с параметром `--debug`. Определить его из грантфайла можно так:

```javascript
var debug = !!grunt.option('debug');
```

Эта переменная нам скоро понадобится.

## JavaScript

В Углифае есть возможность задавать глобальные переменные — что-то вроде препроцессора: переменная в коде заменяется значением, а образовавшийся мёртвый код (`if (false) { /* Например, такой */ }`) удаляется. 

Переменные можно задавать из [командной строки](https://github.com/mishoo/UglifyJS#usage) или через грантфайл:

```javascript
uglify: {
	options: {
		compress: {
			global_defs: {
				DEBUG: debug  // Та самая переменная
			}
		}
	},
	main: {
		files: {
			"build/scripts.js": "build/scripts.js"
		}
	}
}
```

Пример использования переменной в Яваскрипте:

```javascript
/*global DEBUG:true*/
// Отладочный режим по умолчанию (можно сделать и наоборот)
if (typeof DEBUG === 'undefined') DEBUG = true;

;(function() {
	'use strict';

	// …
	if (DEBUG) {
		alert('Это сообщение появится только в отладочном режиме');
	}
	// …

}());
```

## Stylus

В Стилусе всё ещё проще. Грантфайл:

```javascript
stylus: {
	options: {
		define: {
			DEBUG: debug
		}
	},
	compile: {
		files: {
			"build/styles.css": "styles/index.styl"
		}
	}
}
```

И пример использования:

```css
DEBUG ?= true

div
	outline: 1px solid #c0ffee if DEBUG
```
