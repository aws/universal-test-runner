# universal-test-runner

[![npm version](https://img.shields.io/npm/v/@aws/universal-test-runner)](https://www.npmjs.com/package/@aws/universal-test-runner)
[![npm downloads](https://img.shields.io/npm/dm/@aws/universal-test-runner)](https://npm-stat.com/charts.html?package=%40aws%2Funiversal-test-runner)
[![build status](https://github.com/aws/universal-test-runner/actions/workflows/build.yml/badge.svg)](https://github.com/aws/universal-test-runner/actions/workflows/build.yml)
[![codecov](https://codecov.io/github/aws/universal-test-runner/branch/main/graph/badge.svg?token=6TIM7H9HC5)](https://codecov.io/github/aws/universal-test-runner)

A universal test runner for any language and test framework.

**❗️ NB: universal-test-runner is currently working towards a 1.0.0 release.
See the [1.0.0 milestone](https://github.com/aws/universal-test-runner/milestone/1) 
for all progress towards 1.0.0. ❗️**

## 🌎 What is universal-test-runner?

universal-test-runner is a command-line tool that uses the [Test Execution
Protocol](./protocol/README.md) to run tests for any programming language and
any test framework.

**Installation**: Install globally using npm:

```
$ npm install -g @aws/universal-test-runner 
```

Now the `run-tests` executable is available to be used.

**Usage**: For example, to run a single test named "test1" in a
project using [jest](https://jestjs.io/), you can run the following:

```
$ export TEP_TESTS_TO_RUN="test1" # set by IDE or CI/CD system

$ run-tests jest
PASS  ./index.test.js
  Suite1
    ✓ test1 (2 ms)
    ○ skipped test2
    ○ skipped test3

Test Suites: 1 passed, 1 total
Tests:       2 skipped, 1 passed, 3 total
Snapshots:   0 total
Time:        0.288 s, estimated 1 s
Ran all test suites with tests matching "test1".
```

How about running a test named "test1", but for a project using
[pytest](https://pytest.org)? Easy -- we can use the same command!

```
$ export TEP_TESTS_TO_RUN="test1" # set by IDE or CI/CD system

$ run-tests pytest
================== test session starts =====================
platform darwin -- Python 3.10.9, pytest-7.1.3, pluggy-1.0.0
collected 3 items / 2 deselected / 1 selected

test_example.py .
```

As shown in these examples, the Test Execution Protocol is used to establish a
unified interface for passing arguments to different test frameworks and
runners.  Check out [RFC 0001](./protocol/rfcs/0001/README.md) for the
motivation behind universal-test-runner and the Test Execution Protocol, and
why having a common interface is so useful.

## 🤔 When should I use universal-test-runner?

You should install universal-test-runner in the following cases:

* Your IDE or CI/CD system tells you to, in order for it to support running tests according to the [Test Execution Protocol](./protocol/README.md)
* You're developing an adapter for universal-test-runner, and you want to test your adapter
* You're writing an IDE plugin or CI/CD integration that implements the Test Execution Protocol, and you need a protocol-aware runner to test your integration

## 📈 Framework and build tool support

First-party test adapter support is provided for the following frameworks/build tools:

* jest: https://jestjs.io/
* pytest: https://pytest.org
* maven: https://maven.apache.org/
* gradle: https://gradle.org/
* dotnet: https://learn.microsoft.com/en-us/dotnet/core/tools/

See the [1.0.0 milestone](https://github.com/aws/universal-test-runner/milestone/1)
for all frameworks and build tools we plan to support for v1.0.0.

## 📦 Packages in this monorepo

The only package you should install and depend on is
[`@aws/universal-test-runner`](./packages/universal-test-runner),
which follows [semantic versioning](https://semver.org/).

The other packages are either internal utilities or adapters that have unstable
APIs and won't necessarily follow semver. You should avoid depending on them
directly.

## 🔋 Custom adapters

It's possible to write custom adapters and pass them to universal-test-runner,
providing support for new frameworks or custom testing setups. See the docs on
[writing custom adapters](#-writing-adapters) for how to implement one.

If you write a custom adapter, please host it in its own GitHub repo and
publish it to npm; then [open a pull request](https://github.com/aws/universal-test-runner/compare)
to add it to our [list of known third-party adapters](./docs/third-party-adapters.md),
so everyone can benefit. (Note that we won't be adding the source code of
third-party adapters directly to this repo.)

Example of using a third-party adapter from npm:

```
npm install -g my-awesome-adapter
run-tests my-awesome-adapter
```

If you have a specific project setup that you don't think merits a generic
third-party adapter, you can pass an adapter from a local file:

```
run-tests ./my-local-adapter.js
```

If universal-test-runner doesn't suit your needs exactly, you can use it as an
example of how to write your own Test Execution Protocol-aware runner. See the
[writing custom runners](#-custom-runners) and the 
[Test Execution Protocol](./protocol/README.md) docs for more info.

## 👩‍💻 Writing adapters

Test adapters are responsible for executing tests as specified by the Test
Execution Protocol, and reporting the status of the test execution back to
universal-test-runner. The runner will do all the work of parsing the protocol
environment variables, and then invoke the `executeTests` function exposed by
the adapter.

* The `executeTests` function must accept an input object of type [`AdapterInput`](./packages/universal-test-runner-types/src/index.ts)
* The `executeTests` function must return an ouput object of type [`AdapterOutput`](./packages/universal-test-runner-types/src/index.ts) or `Promise<AdapterOutput>`.
  * If the adapter executes the tests successfully, and the test run passes, `executeTests` should return an exitCode of `0` (or a promise resolved with an exitCode of `0`).
  * If the adapter executes the tests successfully, and the test run fails, `executesTests` should return a non-zero exitCode (or a promise resolved with a non-zero exitCode).
  * If the adapter cannot execute the tests due to an unrecoverable error, `executeTests` should throw an error (or return a rejected promise).

Two simple adapters are shown below, with the details of test execution omitted:

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

Adapters can also accept a second argument called `context` of type
[`RunnerContext`](./packages/universal-test-runner-types/src/index.ts):
- `context.cwd`: prefer this value over using `process.cwd()` in your adapter. This allows the runner to execute the adapter in a different working directory from where the runner is executed, if needed, while still allowing the adapter to produce any artifacts (like reports) in the correct location.
- `context.extraArgs`: Any unparsed, tokenized values passed to the runner after the end-of-argument marker `--`. Allows adapters to accommodate arbitrary flags being passed through the runner to the adapter.
  - For example, you could pass a custom jest config to the jest adapter by running `run-tests jest -- --config ./path/to/config.js`
- `context.logLevel`: The log level passed by the user to the runner when invoked from the command line, of type [`LogLevel`](./packages/universal-test-runner-types/src/index.ts). If adapters log anything when being executed, they should set the log level of their logger according to this value, where level rank from highest to lowest is `error`, `warn`, `info`, `debug`. Logs should only be written if their level rank is at least the rank of the specified log level, e.g. if the log level is `warn`, only logs of rank `error` and `warn` should be written.

Here's an abridged example of an adapter using context:

```javascript
const path = require('path')

export function executeTests({ testNamesToRun }, { cwd, extraArgs, logLevel }) {
  // Use the log level specified by the runner
  logger.setLogLevel(context.logLevel)

  logger.info('Running tests...')

  // Pass unparsed args to the underlying framework, if the adapter needs to support arbitrary user flags
  const [pass, report] = doTestExecution(extraArgs, testNamesToRun)

  logger.info('Running writing report...')

  // If cwd is needed, prefer context.cwd over process.cwd()
  report.write(path.join(cwd, 'reports', 'junit.xml'))

  if (!pass) {
    logger.error('Tests failed!')
  }

  return { exitCode: pass ? 0 : 1 }
}
```

### Publishing adapters to npm

Structure your adapter as described above, and make sure the `main` field in
your package.json points to a file that exports an `executeTests` function.

## 🏃‍♀️ Custom runners

TODO

## Node.js support

All Active and Maintenance LTS versions of Node.js versions are supported.
Please see the Node.js [release schedule](https://github.com/nodejs/release#release-schedule)
for full details on the LTS process. We'll support the newest Current versions
scheduled for LTS one month after their first release, and maintain support for
old Maintenance versions for at least one month after they go end-of-life.

For example, as of writing, Node.js 14 and 16 are Maintenance LTS releases, and
Node.js 18 is Active LTS, so all three are supported. Once Node.js 14 goes
end-of-life in May 2023, universal-test-runner will support it until June 2023,
after which it will be removed from CI builds. Node.js 20 will become Current
in April 2023, and LTS in October 2023, so universal-test-runner will support
it as early as June 2023.

(In the case that universal-test-runner's dependencies don't permit extended
Maintenance support or early Current support, these one-month paddings may not
be possible, e.g. Jest drops support for Node.js 14 as soon as it goes
end-of-life, or can't run on Node.js 20 until it goes LTS.)

## 🔀 Contributing

Please see the [contributing guide](./CONTRIBUTING.md) for all the logistical
details. Read the existing issues and pull requests before starting to make any
code changes; large changes that haven't been discussed will be rejected
outright in favour of small, incremental changes, so please open an issue early
to discuss anything that may be non-trivial before development starts.

All changes to the Test Execution Protocol must follow the [RFC process](./protocol/README.md).

### Local development setup

[Fork](https://github.com/aws/universal-test-runner/fork) the repository, and then clone your fork:

```
git clone https://github.com/<USERNAME>/universal-test-runner
cd universal-test-runner
```

Make sure you're using the correct Node.js version (install nvm [here](https://github.com/nvm-sh/nvm) if needed):

```
nvm use
```

(Note that npm@8 or greater is required since this project uses 
[npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true).
Node.js 16 and up by default ship with versions of npm that support 
workspaces.)

Install dependencies and build code:

```
npm install
npm run compile
```

Run tests

```
npm test
```

Run integration tests (you may have to install some of the frameworks and build tools manually to get these to pass locally):

```
npm run test:integ
```

Make your changes and commit them. This project follows the 
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#specification)
specification in order to support automatic [semantic versioning](https://semver.org/) 
and changelog generation, so a commit message hook will verify that you've
formatted your commit message correctly. To run the pre-commit hook, you'll
have to install [TruffleHog](https://github.com/trufflesecurity/trufflehog).
Push the changes to your fork, and open a pull request.
