# Guide

* [Scenario](#scenario)
* [Configuration](#configuration)
  + [Base URI](#base-uri)
  + [Variables](#import-variables)
  + [Viewport](#viewport)
* [Step Reference](#step-reference)
  + [Goto](#goto)
    - [Examples](#examples)
  + [Find](#find)
    - [Do action to the found element](#do-action-to-the-found-element)
    - [Extract data from the found element](#extract-data-from-the-found-element)
    - [Traverse found DOM tree](#traverse-found-dom-tree)
    - [Reuse found element](#reuse-found-element)
    - [Examples](#examples-1)
  + [Sleep](#sleep)
    - [Examples](#examples-2)
  + [Screenshot](#screenshot)
    - [Examples](#examples-3)
  + [Pause](#pause)
    - [Examples](#examples-4)
  + [Reserve dialog answer](#reserve-dialog-answer)
    - [Examples](#examples-5)
  + [Run script](#run-script)
    - [Examples](#examples-6)
  + [Import steps](#import-steps)
    - [Specify steps using reference ID](#specify-steps-using-reference-id)

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

You can configure scenario(or scenarios) using `configuration` section.

```yaml
description: My scenario
configuration:
  base_uri: http://localhost 
steps:
  - goto: /page1.html
  - goto: /page2.html
```

### Base URI

`base_uri` sets the default URI prefix. See also [Goto step](#goto).

### Variables
Almost all string fields in steps(e.g. find query, goto url) accept a template placeholder using `"{{ ... }}"` notation.
The variables used in templates can be defined in external files.
And you can import the external files using `import_var`.

```yaml
# scenario.yml

configuration:
  import_var: variables.yaml

  # You can pass a sequence too
  # import_var:
  #   - variables.yaml
steps:
  - goto: "{{ login_page }}"
```

```yaml
# variables.yml

login_page: http://localhost/login.html
```

*Arlecchino* can read not only YAML but also JSON.

And you can also write variables directly in scenario files.

```yaml
# scenario.yml

configuration:
  var:
    login_page: http://localhost/login.html
steps:
  - goto: "{{ login_page }}"
```

### Viewport

`viewport` allows us to set browser's viewport.

For example:

```yaml
configuration:
  viewport:
    width: 1200
    height: 800
```

See also https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport if you want more details.

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

#### Traverse found DOM tree

You can traverse the DOM element by query and use the result as the found element using `traverse` key.

For example, if you have an HTML such as:

```html
<dl>
  <dt>title</dt>
  <dd>description</dd>
</dl>
```

And the following finds the `<dd>description</dd>` element.

```yaml
find:
  query: dt
  with_text: title
  traverse: next
```

The available traversing value are:

- `prev`: The previous sibling element
- `next`: The next sibling element.
- `parent`: The parent element.
- `first_child`: The first child element.
- `last_child`: The last child element.

You can write more complex traversing with sequence:

```yaml
find:
  query: "#some_query"
  traverse:
    - parent
    - next
    - first_child
```

#### Reuse found element

You can reuse the found element at the previous find step using a special query `$0`.

```yaml
steps:
  - find:
      query: .some-class
  # other steps
  - find:
      query: $0 # <- point to the element found at the previous find step
```

And query starting with `$0` such as `$0 .foo` searches for an element inside the last found element.

#### Examples

```yaml
steps:
  - find:
      query: .title
```

```yaml
steps:
  - find:
      query: h1
      with_text: Title
      store:
        from: html
        to: "h1.html"
```

```yaml
steps:
  - find:
      query: tbody tr:first-child > td
      store:
        from text
        to: first_row_value
  - find:
      query: $0
      traverse:
        - parent
        - next
        - first_child
      store:
        from text
        to: second_row_value
```

```yaml
steps:
  - find:
      query: input[name='email']
      action:
        inupt: you@example.com
  - find:
      query: input[type='file']
      action:
        upload: my_profile.png
  - find:
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

```yaml
steps:
  - screenshot:
      name: my_page     # file name to be saved as.
      full_page: false  # whether to capture entire page or not (default: true)
```

#### Examples

```yaml
steps:
  - screenshot        # saved as screenshot_<index>.png
```

```yaml
steps:
  - screenshot:
      name: my_page   # saved as my_page.png
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

### Run script
`run_script` step allows to execute an external JavaScript function.

It invokes the function with [ArlecchinoContext](src/runner/types.ts), which includes Puppeteer's Browser instance, Page instance and some Arlecchino's utilities.

#### Examples

```yaml
steps:
  - run_script: my_script.js
```

```js
// my_script.js
module.exports = async function({ currentPage, resultWriter }) {

  // currentPage is a Puppeteer page instance
  const cookies = await currentPage.evaluate(() => {
    return Promise.resolve(document.cookie.split(";"));
  });

  // write JSON file into result directory
  await resultWriter.writeObjAsJson("cookies.json", cookies);
};
```

### Import steps

`import_steps` is a special step. Strictly it's not a step, but it's allowed to be written as steps sequence items.
You can refactor your scenarios or implement "Page Object Pattern" test using this.

It imports steps defined in other files statically and expand them.

```yaml
# main.yml
description: Main scenario
steps:
  - import_steps: login.yml
  - wait_for_navigation
  - echo: Success!
```

```yaml
# login.yml
steps:
  - goto: /login
  - find:
      query: input[type='submit']
      action: click
```

The above example results the following.

```yaml
description: Main scenario
steps:
  - goto: /login
  - find:
      query: input[type='submit']
      action: click
  - wait_for_navigation
  - echo: Success!
```

A steps file to be imported only needs to have `steps:` definition.
So, any scenario file also is importable.

#### Specify steps using reference ID

Sometimes a YAML file has multiple `steps` mappings.
In such a case you must specify which steps to import using `ref_id`.

You need to write `import_steps: <file name>$<ref_id>` to specify steps with the reference ID and add `ref_id:` key to the file to be imported.

```yaml
# main.yml
description: Main scenario
steps:
  - import_steps: po.yml$open
  - import_steps: po.yml$submit
```

```yaml
# po.yml
- ref_id: open
  steps:
    - goto: /login
- ref_id: submit
  steps:
    - find:
        query: input[type='submit']
        action: click
    - wait_for_navigation
```
