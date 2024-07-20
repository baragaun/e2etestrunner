import fs from 'fs';

import { E2eTestSuiteConfig, LogLevel } from './definitions';
import { BgE2eTestSuite } from './BgE2eTestSuite';
import logger from './helpers/logger';

export const run = async (
  config?: E2eTestSuiteConfig,
  logLevel?: LogLevel,
): Promise<string> => {
  if (logLevel) {
    logger.setLogLevel(logLevel);
  } else if (process.env.BG_E2E_LOG_LEVEL) {
    logger.setLogLevel(process.env.BG_E2E_LOG_LEVEL)
  }

  if (!config && process.env.BG_E2E_TEST_SUITE) {
    try {
      config = JSON.parse(process.env.BG_E2E_TEST_SUITE) as E2eTestSuiteConfig;
    } catch (error) {
      logger.error('run: failed to parse BG_E2E_TEST_SUITE.',
        { BG_E2E_TEST_SUITE: process.env.BG_E2E_TEST_SUITE, error });
      return JSON.stringify({ error: `Failed to parse config env var BG_E2E_TEST_SUITE` });
    }
  }

  if (!config && process.env.BG_E2E_TEST_SUITE_PATH) {
    const configPath = process.env.BG_E2E_TEST_SUITE_PATH;
    const json = fs.readFileSync(configPath, 'utf8');

    if (!json) {
      logger.error('run: failed to load config from file.', { configPath });
      return JSON.stringify({ error: `Failed to load config from '${configPath}'` });
    }

    try {
      config = JSON.parse(json.toString()) as E2eTestSuiteConfig;
    } catch (error) {
      logger.error('run: failed to parse config file.', { configPath, error });
      return JSON.stringify({ error: `Failed to parse config file '${configPath}'` });
    }
  }

  if (!config) {
    logger.error('run: No config specified.');
    return JSON.stringify({ error: 'No config specified.' });
  }

  const suite = new BgE2eTestSuite(config);
  const result = await suite.run();
  logger.info('run: finished.', { result });

  return JSON.stringify(result);
};

export default run;
