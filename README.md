# Netlify Hashfiles Build Plugin

[![NPM version](https://badge.fury.io/js/netlify-plugin-hashfiles.svg)](http://badge.fury.io/js/netlify-plugin-hashfiles)
[![Build Status](https://travis-ci.org/Munter/netlify-plugin-hashfiles.svg?branch=master)](https://travis-ci.org/Munter/netlify-plugin-hashfiles)
[![Coverage Status](https://img.shields.io/coveralls/Munter/netlify-plugin-hashfiles.svg)](https://coveralls.io/r/Munter/netlify-plugin-hashfiles?branch=master)
[![Dependency Status](https://david-dm.org/Munter/netlify-plugin-hashfiles.svg)](https://david-dm.org/Munter/netlify-plugin-hashfiles) [![Greenkeeper badge](https://badges.greenkeeper.io/Munter/netlify-plugin-hashfiles.svg)](https://greenkeeper.io/)

Hashfiles sets you up with an optimal caching strategy for static sites, where static assets across pages are cached for as long as possible in the visitors browser and never have to be re-requested.

Hashfiles will move your static into a single static file directory which it sets up with immutable cache headers. All static files will be renamed to contain a hash of their content, making them content-addressable and thus well suited for immutable caching.

Relevant files that need to retain their names are not moved:

- Entry points
- HTML pages with incoming links
- /favicon.ico
- /\*.txt
- Cache manifests
- Serviceworkers
- News feeds (RSS, Atom)

## Installation

To install, add the following lines to your `netlify.toml` file:

```toml
[[plugins]]
package = "netlify-plugin-hashfiles"
```

_The `[[plugins]]` line is required for each plugin, even if you have other plugins in your `netlify.toml` file already._

**IMPORTANT NOTE:** Hashing files has to be the last thing you do before deploying. Make sure you add hashfiles at the bottom of your plugin configuration.

## Configuration

Hashfiles works out of the box, but can be improved upon with some improved knowledge about your site.

These are the configuration options with their default values:

```toml
[[plugins]]
package = "netlify-plugin-hashfiles"

  [plugins.inputs]
  # An array of glob patterns for pages on your site. Recursive traversal will start from these
  entryPoints = [
    "*.html"
  ]

  # Directory where content-addressable files are moved and immutable cache-headers are set
  staticDir = "/static/"
```

## License

[BSD 3-Clause License](<https://tldrlegal.com/license/bsd-3-clause-license-(revised)>)
