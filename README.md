# loopback-include-through-mixin

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-downloads-url]
[![devDependency Status](https://david-dm.org/JonnyBGod/loopback-include-through-mixin/dev-status.svg)](https://david-dm.org/JonnyBGod/loopback-include-through-mixin#info=devDependencies)
[![Build Status](https://img.shields.io/travis/JonnyBGod/loopback-include-through-mixin/master.svg?style=flat)](https://travis-ci.org/JonnyBGod/loopback-include-through-mixin)

[![MIT license][license-image]][license-url]
[![Gitter Chat](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/loopback-include-through-mixin/Lobby)

##Features

- include though model properties with queries
- setup default bahavior
- use as mixin

##Installation

```bash
npm install loopback-include-through-mixin --save
```

##How to use


Add the mixins property to your server/model-config.json like the following:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-include-through-mixin",
      "../common/mixins"
    ]
  }
}

```

To use with your Models add the mixins attribute to the definition object of your model config.

```json
{
  "name": "app",
  "properties": {
    "name": {
      "type": "string",
    }
  },
  "relations": {
    "users": {
      "type": "hasMany",
      "model": "user",
      "foreignKey": "appId",
      "through": "userRole"
    }
  },
  "mixins": {
    "IncludeThrough": true,
  }
}
```

Then use in you queries like:

```json
{
  "where": "...",
  "include": "...",
  "includeThrough": true
}
```

```json
{
  "where": "...",
  "include": "...",
  "includeThrough": {
    "fields": "type"
  }
}
```

You can also set default behavior in your model definition with options.

```json
{
  "name": "app",
  "properties": {
    "name": {
      "type": "string",
    }
  },
  "relations": {
    "users": {
      "type": "hasMany",
      "model": "user",
      "foreignKey": "appId",
      "through": "userRole"
    }
  },
  "mixins": {
    "IncludeThrough": {
      "relations": [
        "users"
      ],
      "fields": {
        "users": "type"
      }
    },
  }
}
```

Example of Through Model:

```json
{
  "name": "userRole",
  "properties": {
    "type": {
      "type": "string",
      "required": true,
      "default": "owner",
      "description": "owner | administrator | collaborator"
    }
  },
  "validations": [],
  "relations": {
    "app": {
      "type": "belongsTo",
      "model": "app",
      "foreignKey": "appId"
    },
    "user": {
      "type": "belongsTo",
      "model": "user",
      "foreignKey": "userId"
    }
  }
}
```

##Options

| option | type | description | required |
| ------ | ---- | ----------- | -------- |
|relations| [String] | select relations | false |
|fields| Key/Value Object |  similar to filter fields. Key: relation; Value: fields filter. | false |

- By setting relations in model definition it will return the though model for the specified relations by default
- By passing **includeThrough** in you query filter it will override default **fields**

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/loopback-include-through-mixin.svg
[npm-url]: https://npmjs.org/package/loopback-include-through-mixin
[npm-downloads-image]: https://img.shields.io/npm/dm/loopback-include-through-mixin.svg
[npm-downloads-url]: https://npmjs.org/package/loopback-include-through-mixin
[bower-image]: https://img.shields.io/bower/v/loopback-include-through-mixin.svg
[bower-url]: http://bower.io/search/?q=loopback-include-through-mixin
[dep-status-image]: https://img.shields.io/david/angulartics/loopback-include-through-mixin.svg
[dep-status-url]: https://david-dm.org/angulartics/loopback-include-through-mixin
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg
[license-url]: LICENSE
[slack-image]: https://loopback-include-through-mixin.herokuapp.com/badge.svg
[slack-url]: https://loopback-include-through-mixin.herokuapp.com