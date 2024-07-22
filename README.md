# Baragaun E2E Test Runner

## Purpose

`e2etestrunner` runs through a sequence of end-to-end test for a service that provides an API.
Currently, this API needs to expect JSON requests and respond with JSON, as a GraphQL API will
do. It would be possible to extend `e2etestrunner` to handle non-JSON requests, but we at
Baragaun have not needed that yet. For a RESTful API you'd need to extend it. 
The JSON response is validated using configurable rules and finally, `e2etestrunner` will
list the tests as `passed` or if they failed, with the error that occurred.

To define which tests to run, `e2etestrunner` is given a JS object (of type `E2eTestSuiteConfig`),
or a JSON file that represents such an object. 

You can use `E2eTestConfig` as an npm package and integrate the tests into your own tool
(as we have done with [@baragaun/servicepulse](https://github.com/baragaun/servicepulse)),
or you can use it as a standalone tool either in the terminal as a CLI tool or as part of your 
CI/CD pipeline. 

Each E2E test places of a single HTTP request to the service you want to test, reads the 
response from that service and verifies the response using validation rules that are defined
in the configuration. 

## Create a E2E Test Suite Configuration

The configuration can either be a JavaScript object of type 
[E2eTestSuiteConfig](https://github.com/baragaun/e2etestrunner/blob/55a4b9716328556f9f7e89447bc94ce0e5a269b1/src/definitions.ts#L51)
or a JSON with the same structure.

The configuration has this top level structure:

```
{
  "endpoint": <some-endpoint>,
  "vars": { "var1": <var1>, "var2": <var2> },
  "headers": { "header1": <var1>, "header2": <var2> },
  "sequences": [
    {
       "name": <some-name>,
       "endpoint": <some-endpoint>,
       "method": "POST",
       "headers": { "header3": <var3>, "header4": <var4> },
       "vars": { "var3": <var3>, "var3": <var4> },
       "tests": [
         {
           "endpoint": string;
           "method": 'GET' | 'POST';
           "headers": { "header5": <var5>, "header6": <var6> },
           "data": <HTTP POST body>,
           "response": {
             readVars: [
               "name": <some-variable-name>;
               "scope": "suite",
               "jsonPath": <some-json-path>
             ],
             "checks": [
               "name": <some-test-name>;
               "type": "jsonHttpRequest",
               "jsonPath": "$.data.signUpUser.firstName",
               "dataType": "string",
               "targetVar": "firstName1"
               "waitMilliSecondsBefore": 0,
               "waitMilliSecondsAfter": 2000
               "enabled": true
              ]         
           }
         }
       ],
    }
  ];
}
```

Sequence variables and HTTP headers override those of the test suite. 

## Run In Terminal (CLI)

Your system must have Node >=20 and [git](https://git-scm.com/) available. To install,
run this in the terminal:

```shell
git clone https://github.com/baragaun/e2etestrunner.git
cd e2etestrunner
```

To run this tool, you have to specify the configuration JSON, or point to a file that contains
the configuration. You have choices to do so:

1. In a JSON string in the environment variable `BG_E2E_TEST_SUITE`
2. By specifying the path to a JSON file containing the config using environment variable 
   `BG_E2E_TEST_SUITE_PATH`
3. With the command line arguments `-f <path-to-json-file>`.

```shell
cd lib
node ./cli.js -f ../config/config.json

# Or:
BG_E2E_TEST_SUITE_PATH='../config/config.json' node ./cli.js
```
or:

```shell
npx esrun ./src/cli.js -f config/config.json
```

## Use As NPM Package

To install, run this in the root of your Node.js project:

```shell
npm install https://github.com/baragaun/e2etestrunner.git
```

Or using Yarn:

```shell
yarn add https://github.com/baragaun/e2etestrunner.git
```

```typescript
import { BgE2eTestSuite } from '@baragaun/e2e';

const config: E2eTestSuiteConfig = { ... };
const suite = new BgE2eTestSuite(config);
const result = await suite.run();
if (!result.passed) {
  console.error('Tests failed!');
}
```

See [@baragaun/servicepulse](https://github.com/baragaun/servicepulse/blob/main/src/services/GenericService.ts)'s 
use of this package.

## Logging

The default log level is `fatal`, which means there is no logging, unless the service fails and
can't recover. You can set the log level with the environment variable `BG_E2E_LOG_LEVEL` to any
of the following: `trace`, `info`, `warn`, `error`, `fatal`.

## Validating Responses

Define validation rules in the configuration like so:

```json
    ...
    "checks": [
      {
        "name": "user.firstName",
        "jsonPath": "$.data.signUpUser.firstName",
        "dataType": "string",
        "targetVar": "firstName"
      }
    ]

```

This verifies that the response lists the `firstName` with the value we have saved into this
test suite's variable `firstName`.

## Handling Variables

The tests can share variables that you can define in the configuration. To use a variable when
sending a HTTP request or parsing the HTTP response, insert it like this: `Name: ${fullName}`.

Tests can add to the list of variables when they read data that the service sent in a response. 
For example, you may create a user in one test, then need this user's ID in the next test. 

Example:

```json
{
  ...
  "response": {
    "readVars": [
      {
        "name": "userId",
        "scope": "suite",
        "jsonPath": "$.data.signUpUser.userId"
      }
    ]
  }
}
```
Here, the service responded with a `userId`, and we add this to the test suite's variable. 
