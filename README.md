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

description: Search TypeScript via Google
configuration:
  base_uri: https://google.co.jp
steps:
  - goto: /search
  - find:
      query: input[name='q']
      action:
        input: TypeScript
  - sleep: 300
  - screenshot
  - find:
      query: input[type='submit']
      action: click
  - wait_for_navigation
  - find:
      query: .srg a
      action: click
  - wait_for_navigation
  - screenshot
```

Run.

```sh
$ arlecchino example.yml
```

### Guide
Read [this page](https://github.com/Quramy/arlecchino/blob/master/guide.md).

## License
MIT
