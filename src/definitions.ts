import { E2eTestType, E2eVarDataType } from './enums';
import uuid from './helpers/uuid';

export { Uuid } from './helpers/uuid';
export default uuid;

export * from './enums';
export * from './BgE2eTestSuite';

export interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  data?: any;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  expected?: string;
  found?: string;
}

export interface ValidationCheck {
  name: string;
  jsonPath: string;
  dataType: E2eVarDataType;
  targetVar?: string;
  isEmpty?: boolean;
  enabled?: boolean;
  index?: number | string;

  // dataType = 'boolean':
  targetBooleanValue?: boolean;

  // dataType = 'Date':
  notBeforeDate?: Date;
  notAfterDate?: Date;

  // dataType = 'number':
  targetIntegerValue?: number;
  minNumericValue?: number;
  maxNumericValue?: number;

  // dataType = 'string':
  targetStringValue?: string;
  regexExpression?: string;
  regexFlags?: string;
}

export interface E2eTestSuiteConfig {
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  vars?: E2eTestVar[];
  sequences: E2eTestSequenceConfig[];
  returnVars?: boolean;
  hidePassed?: boolean;
}

export interface E2eTestSuiteResult {
  passed: boolean;
  checks: TestResult[];
  vars?: E2eTestVar[];
  errors?: string[];
}

export interface E2eTestVarAssignment {
  name: string;
  jsonPath: string;
  index?: number | string;
}

export interface E2eTestVar {
  name: string;
  dataType: E2eVarDataType;
  value?: boolean | Date | number | string | null | undefined | (boolean | Date | number | string | null | undefined)[];
  fill?: number;
  fillVal?: string;
}

export interface E2eTestConfig {
  name?: string;
  type: E2eTestType;
  import?: string;
  importVars?: E2eTestVar[];
  vars?: E2eTestVar[];
  waitMilliSecondsBefore?: number;
  waitMilliSecondsAfter?: number;
  repeat?: number | string;
  enabled?: boolean;
  stopIfFailed?: boolean;
  stopOnError?: boolean;
  assignVars?: E2eTestVarAssignment[];
  checks: ValidationCheck[];
}

export interface E2eTestResponse {
  results: TestResult[];
}

export interface JsonHttpRequestE2eTestConfig extends E2eTestConfig {
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  data?: string;
}

export interface MatchStatsE2eTestConfig extends JsonHttpRequestE2eTestConfig {
  oldestLatestActivityAtForSearchers: string;
  oldestLatestActivityAtForMatches: string;
  searcherCount: number;
  matchesCount: number;
  maxResultCount: number;
}

export interface E2eTestSequenceConfig {
  name: string;
  import?: string;
  importVars?: E2eTestVar[];
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  tests: E2eTestConfig[];
  vars?: E2eTestVar[];
  enabled?: boolean;
}
