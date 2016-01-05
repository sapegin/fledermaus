# 2.0.0 - 2016-01-05

## Breaking changes

* Richtypo updated to [1.0.0](https://github.com/sapegin/richtypo.js/releases/tag/1.0.0).
* Highlight.js updated to [9.0.0](https://github.com/isagalaev/highlight.js/blob/master/CHANGES.md#version-900).

# 1.0.2 - 2015-12-25

* Fix source files loading when a single file type specified.
* Show warning when no source files found.

# 1.0.1 - 2015-11-08

* Remove Babel from dependencies.
* Print “done in a moment” if generation time is less than 1 second.

# 1.0.0 - 2015-10-28

* New functions: start, getFirstParagraph, getFirstImage, cleanHtml, groupDocuments, filterDocuments, orderDocuments, paginate.
* New helpers: dateToString, absolutizeLinks.
* Remove functions: tmpl.
* Remove helpers: plural, pageUrl.
* pageAbsUrl  → absolutizeUrl.
* Default config is now "base".
* ICU compatible localization.
* Cut support for posts.
* Custom field parsers.
* Expose custom Marked renderer class.
* Many small improvements.
* Bug fixes.

# 0.1.1 - 2015-10-08

* Publish ES5 to npm instead of ES6.

# 0.1.0 - 2015-10-08

* First version.
