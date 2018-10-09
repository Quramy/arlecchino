# Arlecchino

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
$ arlecchino -s example.yml
```

### Guide
*T.B.D.*

## License
MIT
