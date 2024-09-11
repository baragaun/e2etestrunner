import logger from './logger';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const fetchJsonAxios = async <T = any>(config: AxiosRequestConfig): Promise<{
  response: AxiosResponse | undefined;
  data?: T | string;
  error?: string;
}> => {
  logger.trace('fetchJsonAxios called.', { config });
  let response: AxiosResponse | undefined = undefined;

  try {
    response = await axios.request(config);

    //logger.trace('fetchJson: received response', { JSON.stringify(response) });

    if (!response) {
      logger.warn('fetchJsonAxios: no response', { config });
      return { response, error: 'no-response' };
    }

    if (response.status > 399) {
      try {
        const data = response.data;
        const error = response.status === 401
          ? 'unauthorized'
          : 'server-error';
        return { response, data, error };
      } catch (error) {
        logger.error('fetchJsonAxios: error', { config, error });
        return { response, error: 'server-error' };
      }
    }

    try {
      const data = response.data as T | undefined;
      return { response, data };
    } catch (error) {
      logger.error('fetchJsonAxios: error', { config, error });
      return { response, error: 'error-reading-response' };
    }
  } catch (error) {
    logger.error('fetchJsonAxios: error', { config, error });
    return { response: response, error: (error as Error).message };
  }
};

export default fetchJsonAxios;
