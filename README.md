# Arlecchino
[![CircleCI](https://circleci.com/gh/Quramy/arlecchino.svg?style=svg)](https://circleci.com/gh/Quramy/arlecchino)
[![npm version](https://badge.fury.io/js/arlecchino.svg)](https://badge.fury.io/js/arlecchino)

DSL for e2e testing.

## Getting started

```
$ npm install -g arlecchino
```

Write test scenario.

```yaml
# example.yml

description: Search Arlecchino with NPM
steps:
  - goto: https://www.npmjs.com
  - find:
      query: input[type='search'][name='q']
      action:
        input: arlecchino
  - screenshot
  - find:
      query: form#search
      action: submit
  - wait_for_navigation
  - sleep: 300
  - screenshot
```

And run the scenario.

```sh
$ arlecchino example.yml
```

### Guide
Read [this page](https://github.com/Quramy/arlecchino/blob/master/guide.md).

## License
MIT
