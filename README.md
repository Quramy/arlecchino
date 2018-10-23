# Arlecchino
[![CircleCI](https://circleci.com/gh/Quramy/arlecchino.svg?style=svg)](https://circleci.com/gh/Quramy/arlecchino)
[![npm version](https://badge.fury.io/js/arlecchino.svg)](https://badge.fury.io/js/arlecchino)

End-to-End testing library for Web apps.

## Getting started

```sh
$ npm install -g arlecchino
```

Write a scenario file.

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
      query: "form#search"
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

### How it works
Arlecchino uses [GoogleChrome/Puppeteer](https://github.com/GoogleChrome/puppeteer).

## License
MIT
