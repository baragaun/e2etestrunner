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
  dataType: 'boolean' | 'date' | 'number' | 'string';
  targetVar?: string;
  shouldBeEmpty?: boolean;
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
  vars?: E2eTestVar[];
  headers?: { [key: string]: string };
  sequences: E2eTestSequenceConfig[];
}

export interface E2eTestSuiteResult {
  passed: boolean;
  checks: TestResult[];
}

export interface E2eTestVarAssignment {
  name: string;
  scope: 'suite' | 'sequence';
  jsonPath: string;
  index?: number | string;
}

export interface E2eTestResponse {
  assignVars?: E2eTestVarAssignment[];
  checks: ValidationCheck[];
}

export interface E2eTestVar {
  name: string;
  dataType: E2eVarDataType;
  value?: boolean | Date | number | string | null | undefined | (boolean | Date | number | string | null | undefined)[];
}

export interface E2eTestConfig {
  name?: string;
  type: E2eTestType;
  vars?: E2eTestVar[];
  waitMilliSecondsBefore?: number;
  waitMilliSecondsAfter?: number;
  repeat?: number;
  enabled?: boolean;
}

export interface JsonHttpRequestE2eTestConfig extends E2eTestConfig {
  endpoint: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  data?: string;
  response: E2eTestResponse;
}

export interface E2eTestSequenceConfig {
  name: string;
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  tests: E2eTestConfig[];
  vars?: E2eTestVar[];
  enabled?: boolean;
}
