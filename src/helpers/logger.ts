import { LogLevel } from '../enums';

let logLevel = LogLevel.fatal;

const log = (level: LogLevel, message: string, data?: Object) => {
  if (level < logLevel) {
    return;
  }
  console.log(JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    message,
    data,
  }))
}

const logger = {
  setLogLevel: (level: LogLevel) => {
    logLevel = level ?? LogLevel.fatal
  },

  trace: (message: string, data?: Object) => log(LogLevel.trace, message, data),
  info: (message: string, data?: Object) => log(LogLevel.info, message, data),
  warn: (message: string, data?: Object) => log(LogLevel.warn, message, data),
  error: (message: string, data?: Object) => log(LogLevel.error, message, data),
  fatal: (message: string, data?: Object) => log(LogLevel.fatal, message, data),
}

export default logger
