# Guide

## Scenario

A scenario file should have the following structure.

```yaml
description: My scenario
steps:
  - goto: http://localhost/page.html
```

- `description`: Description of the scenario. *Arlecchino* uses this value as an output directory name.
- `steps`: Steps to execute

You can write multiple scenarios in a file. For example:

```yaml
scenario:
  - description: My first scenario
    steps:
      - goto: http://localhost/page.html
  - description: My second scenario
    steps:
      - goto: http://localhost/another_page.html
```

## Configuration
*T.B.D.*

## Step Reference

### Goto

This step navigates the current page to given URL.

If you give a URL fragment, it joins `configuration.base_uri` and the fragment.

#### Examples

```yaml
steps:
  - goto: https://github.com/Quramy/arlecchino
```

```yaml
configuration:
  base_uri: https://github.com
steps:
  - goto: /Quramy/arlecchino # navigate to https:github.com/Quramy/arlecchino
```

### Find

*find* is one of the most important steps.

It allows us the following:

- Assertion of HTML element existence
- Extract data from the found HTML element
- Manipulation of the found HTML element

This step requires `query` key. And `query` value must be a valid CSS selector.

For example:

```yaml
find:
  query: h2
```

The above query searches HTML elements whose tag is `<h2>` and returns the first element of the results.

Sometimes CSS queries does not satisfy us. In that case, we can use `with_text` key.
It filters the results of the CSS selector using the text it contains.

```yaml
find:
  query: h2
  with_text: License
```

For example, the above returns an HTML Element that is `<h2> License </h2>`.

#### Do action to the found element

You can manipulate the found element using `action` key. The available actions are the following.

- `click`
- `input: <text to type>`
- `submit`: It's allowed only when the element is `form`.
- `upload: <filepath(s) to upload>`: It's allowed only when the element is `input[type='file']`

#### Extract data from the found element

You can extract some data from the found element using `store` key.

We explain with a simple example. The current page displays the following HTML.

```html
<body>
  <h1>A page title</h1>
</body>
```

And we execute the following find step:

```yaml
find:
  query: h1
  store:
    from: text
    to: "h1.title"
```

Finally, *Arlecchino* outputs the following JSON as `storedValues.json` file into the scenario result directory.

```json
"h1": {
  "title": "A page title"
}
```

The `store` hash has the following structure.

- `from`: The data type to extract from the element. The following values are available.
  - `text`: Text contents
  - `html`: Inner HTML
- `to`: The property name to output. You can use JSON accessor notation.

And the stored value can be referenced by templates of after steps.

#### Examples

```yaml
steps:
  find:
    query: .title
```

```yaml
steps:
  find:
    query: h1
    with_text: Title
    store:
      from: html
      to: "h1.html"
```

```yaml
steps:
  find:
    query: input[name='email']
    action:
      inupt: you@example.com
  find:
    query: input[type='file']
    action:
      upload: my_profile.png
  find:
    query: input[type='submit']
    action: click
```

### Sleep
This step waits for a given time. And the time unit is millisecond.

#### Examples

```yaml
steps:
  - sleep: 3000 # wait for 3 seconds
```

### Screenshot
This step captures the current page and stores PNG image file.

#### Examples

```yaml
steps:
  - screenshot
```

### Pause
This step makes sense only when *Arlecchino* runs with `-d` or `--showBrowser` option.

This step pauses the step executor. So you can inspect the browser's page using this.

And you want restart executor's steps, type `_resume_()` and return key in developer's console at the page.

#### Examples

```yaml
steps:
  - pause
```

### Reserve dialog answer
This step reserves your answer for the next alert/confirm/prompt dialog. It should be executed before the dialog raises.


```yaml
steps:
  - reserve_dialog_answer   # reserve to close dialog
  - find:
      query: button.open-some-dialog
      action: click         # this action kicks some dialog and Arlecchino is going to close it
```

#### Examples

```yaml
steps:
  - reserve_dialog_answer
```

```yaml
steps:
  - reserve_dialog_answer:
      accept: false # dismiss prompt/confirm
```

```yaml
steps:
  - reserve_dialog_answer:
      text: prompt message
```
