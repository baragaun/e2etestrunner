export enum E2eTestType {
  jsonHttpRequest = 'json-http-request',
  wait = 'wait',
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
