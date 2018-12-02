# foxify-restify-odin <!-- omit in toc -->

Easily restify odin databases

[![Npm Version](https://img.shields.io/npm/v/foxify-restify-odin.svg)](https://www.npmjs.com/package/foxify-restify-odin)
[![Node Version](https://img.shields.io/node/v/foxify-restify-odin.svg)](https://nodejs.org)
[![TypeScript Version](https://img.shields.io/npm/types/foxify-restify-odin.svg)](https://www.typescriptlang.org)
[![Package Quality](https://npm.packagequality.com/shield/foxify-restify-odin.svg)](https://packagequality.com/#?package=foxify-restify-odin)
[![Npm Total Downloads](https://img.shields.io/npm/dt/foxify-restify-odin.svg)](https://www.npmjs.com/package/foxify-restify-odin)
[![Npm Monthly Downloads](https://img.shields.io/npm/dm/foxify-restify-odin.svg)](https://www.npmjs.com/package/foxify-restify-odin)
[![Open Issues](https://img.shields.io/github/issues-raw/foxifyjs/foxify-restify-odin.svg)](https://github.com/foxifyjs/foxify-restify-odin/issues?q=is%3Aopen+is%3Aissue)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/foxifyjs/foxify-restify-odin.svg)](https://github.com/foxifyjs/foxify-restify-odin/issues?q=is%3Aissue+is%3Aclosed)
[![Known Vulnerabilities](https://snyk.io/test/github/foxifyjs/foxify-restify-odin/badge.svg?targetFile=package.json)](https://snyk.io/test/github/foxifyjs/foxify-restify-odin?targetFile=package.json)
[![Dependencies Status](https://david-dm.org/foxifyjs/foxify-restify-odin.svg)](https://david-dm.org/foxifyjs/foxify-restify-odin)
[![Pull Requests](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/foxifyjs/foxify-restify-odin/pulls)
[![License](https://img.shields.io/github/license/foxifyjs/foxify-restify-odin.svg)](https://github.com/foxifyjs/foxify-restify-odin/blob/master/LICENSE)
[![Build Status](https://api.travis-ci.com/foxifyjs/foxify-restify-odin.svg?branch=master)](https://travis-ci.com/foxifyjs/foxify-restify-odin)
[![Coverage Status](https://codecov.io/gh/foxifyjs/foxify-restify-odin/branch/master/graph/badge.svg)](https://codecov.io/gh/foxifyjs/foxify-restify-odin)
[![Github Stars](https://img.shields.io/github/stars/foxifyjs/foxify-restify-odin.svg?style=social&label=Stars)](https://github.com/foxifyjs/foxify-restify-odin)
[![Github Forks](https://img.shields.io/github/forks/foxifyjs/foxify-restify-odin.svg?style=social&label=Fork)](https://github.com/foxifyjs/foxify-restify-odin)

## Table on Contents <!-- omit in toc -->

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [Documentation](#documentation)
  - [Filters](#filters)
  - [include](#include)
  - [sort](#sort)
  - [skip](#skip)
  - [limit](#limit)
- [Versioning](#versioning)
- [Authors](#authors)
- [License](#license)
- [Support](#support)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download) `8.12` or higher is required.
- [foxify](https://github.com/foxifyjs/foxify) `0.10.14` or higher is required.
- [@foxify/odin](https://github.com/foxifyjs/odin) `0.2.2` or higher is required.

### Installation

```bash
npm i -s foxify-restify-odin
```

### Usage

```javascript
const Foxify = require('foxify');
const restify = require('foxify-restify-odin');
const User = require('./models/User');

let app = new Foxify();

app.get('/users', restify(User), async (req, res) => {
  res.json({
    users: await req.fro.query.get(),
    total_users: await req.fro.counter.count(),
  });
});

app.start();
```

## Documentation

```typescript
type Operator = "lt" | "lte" | "eq" | "ne" | "gte" | "gt" |
  "ex" | "in" | "nin" | "bet" | "nbe" | "lk" | "nlk";

interface FilterObject {
  field: string;
  operator: Operator;
  value: string | number | boolean | any[] | object | Date;
}

interface Filter {
  and?: Array<FilterObject | Filter>;
  or?: Array<FilterObject | Filter>;
}

interface Query {
  filter?: Filter | FilterObject;
  include?: string[];
  sort?: string[];
  skip?: number;
  limit?: number;
}

restify(Model: typeof Odin, defaults?: Query): Foxify.Handler;
```

This middleware parses url query string and executes a query on the given model accordingly and passes the `query` to you (since you might need to do some modifications on the query, too)

It also passes a `counter` which is exactly like `query` but without applying `skip`, `limit`, `sort` just because you might want to send a total count in your response as well

Lastly it passes the a `decoded` key in `req.fro` which is the parsed query string that is used in the middleware

**Stringify all query params using [qs](https://www.npmjs.com/package/qs) default options**

All the possible query modifiers are explained as a single modification but they all can be used together

`/users?sort%5B0%5D=age`

### Filters

```javascript
qs.stringify({
  filter: {
    field: "username",
    operator: "eq",
    value: "ardalanamini",
  }
})
```

```javascript
qs.stringify({
  filter: {
    or: [
      {
        field: "username",
        operator: "eq",
        value: "ardalanamini",
      },
      {
        and: [
          {
            field: "age",
            operator: "gte",
            value: 18,
          },
          {
            field: "email",
            operator: "ex",
            value: true,
          },
        ],
      },
    ],
  },
})
```

filter can be a single filter object or `and`/`or` of Array\<filter object\>

possible operators:

`lt` | `lte` | `eq` | `ne` | `gte` | `gt` | `ex` | `in` | `nin` | `bet` | `nbe`

### include

```javascript
qs.stringify({
  include: [
    "relation1",
    "relation2",
  ]
})
```

### sort

```javascript
qs.stringify({
  sort: [
    "field1", // same as "+field1"
    "-field2",
    "+field3",
  ]
})
```

### skip

```javascript
qs.stringify({
  skip: 100,
})
```

### limit

```javascript
qs.stringify({
  limit: 10,
})
```

## Versioning

We use [SemVer](http://semver.org) for versioning. For the versions available, see the [tags on this repository](https://github.com/foxifyjs/foxify/tags).

## Authors

- **Ardalan Amini** - *Owner/Developer* - [@ardalanamini](https://github.com/ardalanamini)

See also the list of [contributors](https://github.com/foxifyjs/foxify/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Support

If my work helps you, please consider

[![Become A Patron](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/ardalanamini)

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/ardalanamini)
