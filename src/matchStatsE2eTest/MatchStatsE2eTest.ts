import { BgE2eTest } from '../BgE2eTest';
import {
  CreateMatchingEngineResponseData,
  CreateUserSearchResponseData,
  DeleteMatchingEngineResponseData,
  FindUserSearchResultsResponseData,
  GraphqlResponseData,
  MatchingEngine,
  MatchStatsE2eTestConfig,
  UserSearch,
  UserWithScore,
} from './definitions';
import {
  E2eTestConfig,
  E2eTestResponse,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVar,
  HttpRequestConfig,
} from '../definitions';
import { JsonHttpRequestE2eTest } from '../JsonHttpRequestE2eTest';
import fetchJson from '../helpers/fetchJson';
import logger from '../helpers/logger';
import mergeHeaders from '../helpers/mergeHeaders';
import replaceVars from '../helpers/replaceVars';
import replaceVarsInObject from '../helpers/replaceVarsInObject';
import assignVars from '../helpers/assignVars';
import performChecks from '../helpers/performChecks';

export class MatchStatsE2eTest extends JsonHttpRequestE2eTest {
  protected searcherIds: string[] | undefined;
  protected userSearches: UserSearch[] | undefined;
  protected matchingEngine: MatchingEngine | undefined;

  protected async createMatchingEngine(
    searcherId: string,
    vars: { [key: string]: string }[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendGraphQlRequest<CreateMatchingEngineResponseData>(
      config.createMatchingEngineRequestData,
      vars.concat([{ createdBy: searcherId }]),
    );

    this.matchingEngine = data.createMatchingEngine;
  }

  protected async createUserSearch(
    searcherId: string,
    vars: { [key: string]: string }[],
  ): Promise<UserSearch> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendGraphQlRequest<CreateUserSearchResponseData>(
      config.createUserSearchRequestData,
      vars.concat([{ createdBy: searcherId }]),
    );

    return data.createUserSearch;
  }

  protected async createUserSearches(
    vars: { [key: string]: string }[],
  ): Promise<void> {
    this.searcherIds = [];
    this.userSearches = await Promise.all(
      this.searcherIds.map((searcherId) => this.createUserSearch(searcherId, vars))
    );
  }

  protected async deleteMatchingEngine(
    vars: { [key: string]: string }[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    if (!this.matchingEngine) {
      logger.warn('BgE2eTestSuite.deleteMatchingEngine: this.matchingEngine not set.',
        { test: this, vars });
      return;
    }

    await this.sendGraphQlRequest<DeleteMatchingEngineResponseData>(
      config.createMatchingEngineRequestData,
      vars.concat([{ id: this.matchingEngine.id }]),
    );

    this.matchingEngine = undefined;
  }

  protected async deleteUserSearches(
    vars: { [key: string]: string }[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    if (!Array.isArray(this.userSearches) || this.userSearches.length < 1) {
      logger.warn('BgE2eTestSuite.deleteUserSearches: no userSearches saved.',
        { test: this, vars });
    }

    const clazz = this;
    await Promise.all(
      this.userSearches!.map((userSearch) => {
        return clazz.sendGraphQlRequest<FindUserSearchResultsResponseData>(
          config.deleteUserSearchesRequestData,
          vars.concat({ userSearchId: userSearch.id }),
        );
      })
    );

    this.userSearches = undefined;
  }

  protected async loadSearchResult(
    userSearch: UserSearch,
    vars: { [key: string]: string }[],
  ): Promise<UserWithScore[]> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendGraphQlRequest<FindUserSearchResultsResponseData>(
      config.findUserSearchResultsRequestData,
      vars.concat({ userSearchId: userSearch.id }),
    );

    if (!Array.isArray(data) || data.length < 1) {
      return [];
    }

    userSearch.resultRecords = [];

    data.forEach((record) => {
      userSearch.resultRecords!.push({
        userId: record.id,
        score: record.score,
      })
    })

    return data.findUserSearchResults;
  }

  protected async loadAllSearchResults(
    vars: { [key: string]: string }[],
  ): Promise<void> {

    if (!Array.isArray(this.userSearches) || this.userSearches.length < 1) {
      logger.warn('BgE2eTestSuite.loadAllSearchResults: no loadSearchResult saved.',
        { test: this, vars });
    }

    await Promise.all(
      this.userSearches!.map((userSearch) => this.loadSearchResult(userSearch, vars))
    )
  }

  protected async runOnce(
    testName: string,
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    test: BgE2eTest,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse> {
    logger.trace('BgE2eTestSuite.runJsonHttpRequest called',
      { test, sequence, suite });

    const config = testConfig as MatchStatsE2eTestConfig

    let headers = mergeHeaders(suite.headers, sequence.headers);
    headers = replaceVarsInObject(
      mergeHeaders(
        headers,
        config.headers,
      ),
      vars,
      iterationIndex,
    );

    let url = replaceVars(
      config.endpoint || sequence.endpoint || suite.endpoint || '',
      vars,
      iterationIndex,
    );

    if (url.startsWith('env:')) {
      url = process.env[url.substring(4)] || '';
    }

    // Steps:
    // 1. Create MatchingEngine object
    // 2. Pull user IDs.
    // 3. Randomly select user IDs (searcherCount)
    // 4. For each userId, call createUserSearch
    // 5. Save search results
    // 6. Stats??
    // 7. Call deleteUserSearch for all searches
    // 8. Call deleteMatchingEngine

    const requestConfig: HttpRequestConfig = {
      url,
      method: suite.method || sequence.method || config.method,
      headers,
      data: config.data ? replaceVars(config.data, vars, iterationIndex) : '',
    };

    const { response, data, error } = await fetchJson(requestConfig);

    if (error) {
      testResponse.results.push({ name: testName, passed: false, error: `error-in-response: ${error}; data: ${data || ''}` });
      return testResponse;
    }

    if (!response) {
      testResponse.results.push({ name: testName, passed: false, error: `error-response: empty` });
      return testResponse;
    }

    if (!data) {
      testResponse.results.push({ name: testName, passed: false, error: 'no-data-in-response' });
      return testResponse;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      testResponse.results.push({ name: testName, passed: false, error: `error-response: ${data.errors.join(', ')}` });
      return testResponse;
    }

    if (Array.isArray(config.assignVars) && config.assignVars.length > 0) {
      assignVars(
        config.assignVars,
        data,
        iterationIndex,
        vars,
      );
    }

    if (Array.isArray(config.checks) && config.checks.length > 0) {
      testResponse = performChecks(
        testName,
        config.checks,
        data,
        sequence,
        suite,
        vars,
        iterationIndex,
        testResponse,
      );
    }

    return testResponse;
  }

  protected async sendGraphQlRequest<TData extends GraphqlResponseData = GraphqlResponseData>(
    body: string,
    vars: { [key: string]: string }[],
  ): Promise<{
    response: Response | undefined;
    data: TData;
  }> {
    const config = this.config as MatchStatsE2eTestConfig;
    let headers = mergeHeaders(this.suiteConfig!.headers, this.sequenceConfig!.headers);
    headers = replaceVarsInObject(
      mergeHeaders(
        headers,
        config.headers,
      ),
      vars as unknown as E2eTestVar[],
      0,
    );

    let url = replaceVars(
      config.endpoint || this.sequenceConfig!.endpoint || this.suiteConfig!.endpoint || '',
      vars as unknown as E2eTestVar[],
      0,
    );

    if (url.startsWith('env:')) {
      url = process.env[url.substring(4)] || '';
    }

    const requestConfig: HttpRequestConfig = {
      url,
      method: this.suiteConfig!.method || this.sequenceConfig!.method || config.method,
      headers,
      data: body ? replaceVars(body, vars as unknown as E2eTestVar[], 0) : '',
    };

    const { response, data, error } = await fetchJson<TData>(requestConfig);

    if (error) {
      throw new Error('sendGraphQlRequest.createUserSearch: error received.');
    }

    if (!data) {
      throw new Error('sendGraphQlRequest.createUserSearch: no response data received.');
    }

    if (typeof data === 'string') {
      throw new Error('sendGraphQlRequest.createUserSearch: response data is a string.');
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      throw new Error('sendGraphQlRequest.createUserSearch: data.errors received.');
    }

    return { response, data };
  }
}
