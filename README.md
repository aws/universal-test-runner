# codeaws-test-runner

A universal test runner for any language and test framework.

**NB: The name "codeaws-test-runner" is temporary. A rename must be done
_before_ the repo is made public. This tool is not specific to AWS or CODE.AWS
in any way, and should be useful for testing in general, so we don't want to
include any Amazon-related "branding" in the name. (What exactly the name
should be is tough to say; we'll have to do some brainstorming to come up with
a good name.)**

codeaws-test-runner is a command-line tool that uses the [Test Execution
Protocol](./protocol/README.md) to run tests for any programming language and
any test framework. For example, to run tests in a project using Jest:

```
npm install -g @sentinel-internal/codeaws-test-runner 
run-tests jest
```

First-party test adapter support is provided for the following frameworks/build tools:

* Jest
* Pytest
* Maven
* Gradle
* ... and more to come!

It's also possible to write custom adapters and pass them to the runner,
providing support for custom testing setups, or frameworks that don't already
have a first-party or third-party adapter:

```
run-tests ./my-customer-adapter.js
```

If codeaws-test-runner doesn't suit your needs exactly, you can use it as an
example of how to write your own Test Execution Protocol-aware runner. See
the [Test Execution Protocol](./protocol/README.md) docs for more info.

## Test Adapters

Test adapters are responsible for executing the tests and reporting the status
of the test execution back to the runner. Adapters must expose a function
`executeTests` that accepts an object as its argument, and returns a result
object. If there's an error that prevents tests from being executed, the
adapter should throw an error. The adapter can also return a promise. A promise
resolved with the result object indicates that the tests were executed, while a
rejected promise indicates that there was an error that prevented the tests
from being executed.

```javascript
// adapter.js
export function executeTests({ testNamesToRun }) {
  const pass = doTestExecution(testNamesToRun)
  return { exitCode: pass ? 0 : 1 }
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
run-tests ./adapter.js
```

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
