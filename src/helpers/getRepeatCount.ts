import { E2eTestConfig, E2eTestVar, HttpRequestConfig } from '../definitions';
import replaceVars from './replaceVars';

const getRepeatCount = (
  testConfig: E2eTestConfig,
  vars: E2eTestVar[],
): number => {
  if (!testConfig || !testConfig.repeat) {
    return 0;
  }

  if (Number.isInteger(testConfig.repeat)) {
    return testConfig.repeat as number;
  }

  const countString = replaceVars(testConfig.repeat as string, vars, undefined);

  if (!countString) {
    return 0;
  }

  const cnt = Number.parseInt(countString);

  return isNaN(cnt) ? 0 : cnt;
}

export default getRepeatCount;
