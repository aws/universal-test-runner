# codeaws-test-runner

Experimental. Runs tests for any language with any test framework.

Running tests involves two stages:
* _Discovering_ what tests need to be run, and what configuration to run them with
* _Executing_ the discovered tests with the desired configuration

codeaws-test-runner is a command-line tool that discovers tests and test
configuration from the context in which it is invoked, and then executes those
tests using a specified test adapter.

## Terms and definitions

* **Adapter**: Executes tests for a particular tool or framework
* **Runner**: Performs test discovery and invokes adapters
* **Discovery protocol**: Contract between the runner and its execution context, enabling test discovery in that context

## Discovery Protocol

Discovery of tests and configuration is done through environment variables. For
the time being, all environment variables used by the runner are prefixed by
`CAWS_` in an attempt to avoid name collisions. This is subject to change in
future versions of the protocol.

The discovery protocol allows users to write their own custom runners that
consume the environment variables directly.

### CAWS_TEST_NAMES_TO_RUN

Pipe-separated list of names of tests to be run. If not present, ALL tests that can be discovered should be run. 

Format: `name1|name2|name3`

Data type: string

Example: `export CAWS_TEST_TO_RUN="test1|test2|test3"` 

## Test Adapters

codeaws-test-runner must be invoked with an adapter that is responsible for
executing the tests and reporting the status of the test execution back to the
runner. Adapters must expose a function `executeTests` that accepts an object
as its argument, and returns a result object. If there's an error that prevents
tests from being executed, the adapter should throw an error. The adatper can
also return a promise. A promise resolved with the result object indicates that
the tests were executed, while a rejected promise indicates that there was an
error that prevented the tests from being executed.

```javascript
// adapter.js
export function executeTests({ testNamesToRun }) {
  const pass = doTestExecution(testNamesToRun)
  return { exitCode: pass ? 0 : 1 };
}
```

```javascript
// adapter.js
export function executeTests({ testNamesToRun }) {
  return new Promise((resolve, reject) => {
    doTestExecution(testNamesToRun, (err, pass) => {
      if (err) {
        return reject(err)
      }
      resolve({ exitCode: pass ? 0 : 1 });
    })
  })
}
```

The adapter is passed to the runner as follows:

```
codeaws-test-runner ./adapter.js
```

## CLI

TODO

## Custom runners

TODO

## Local development setup

Make sure you're using the correct Node.js version (install nvm [here](https://github.com/nvm-sh/nvm) if needed):

```
nvm use
```

Install dependencies:

```
npm install
```

Run tests

```
npm test
```
