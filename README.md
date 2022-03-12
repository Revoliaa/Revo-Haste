# Revo-Haste
Fast and simple text sharing website.

## Installation
- Download or clone the project.
- Customize the `config.js` file
- Download dependencies with `npm install`
- Run project by typing `node app.js`

## Configuration
* `host` - The host the server runs on
* `port` - The port the server runs on
* `keyLength` -  The length of the keys to user (default 10)
* `maxLength` - Maximum length of a paste (default 400000)
* `staticMaxAge` - Max age for static assets (86400)
* `recompressStaticAssets` - Whether or not to compile static js assets (true)
* `logging` - Logging preferences
* `keyGenerator` - Key generator options (see below)
* `storage` - Storage options (see below)

# License
This website is under MIT license.
