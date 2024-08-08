export enum E2eTestType {
  jsonHttpRequest = 'json-http-request',
  graphqlRequest = 'graphql-request',
  matchStats = 'matching-engine-stats',
}

export enum LogLevel {
  'trace',
  'info',
  'warn',
  'error',
  'fatal',
}

export enum ServiceType {
  generic = 'generic',
  graphql = 'graphql',
}

export enum ServiceStatus {
  ok = 'ok',
  limited = 'limited',
  offline = 'offline',
}

export enum E2eVarDataType {
  boolean = 'boolean',
  date = 'date',
  number = 'number',
  string = 'string',
  booleanArray = 'booleanArray',
  dateArray = 'dateArray',
  numberArray = 'numberArray',
  stringArray = 'stringArray',
}
