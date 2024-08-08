import { HttpRequestConfig } from '../definitions';
import logger from './logger';

const fetchJson = async <T = any>(config: HttpRequestConfig): Promise<{
  response: Response | undefined;
  data?: T | string;
  error?: string;
}> => {
  logger.trace('fetchJson called.', { config });
  let response: Response | undefined = undefined;

  try {
    response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data,
    } as RequestInit);

    logger.trace('fetchJson: received response', { response });

    if (!response) {
      logger.warn('fetchJson: no response', { config });
      return { response, error: 'no-response' };
    }

    if (response.status > 399) {
      try {
        const data = await response.text();
        const error = response.status === 401
          ? 'unauthorized'
          : 'server-error';
        return { response, error, data };
      } catch (error) {
        logger.error('fetchJson: error', { config, error });
        return { response, error: 'server-error' };
      }
    }

    try {
      const data = await response.json() as T | undefined;
      return { response, data };
    } catch (error) {
      logger.error('fetchJson: error', { config, error });
      return { response, error: 'error-reading-response' };
    }
  } catch (error) {
    logger.error('fetchJson: error', { config, error });
    return { response: response, error: (error as Error).message };
  }
};

export default fetchJson;
