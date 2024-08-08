import { BgE2eTest } from '../BgE2eTest';
import {
  CreateMatchingEngineResponseData,
  CreateUserSearchResponseData,
  DeleteMatchingEngineResponseData,
  FindUserSearchResultsResponseData,
  FindUsersResponseData,
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
} from '../definitions';
import { JsonHttpRequestE2eTest } from '../JsonHttpRequestE2eTest';
import logger from '../helpers/logger';

export class MatchStatsE2eTest extends JsonHttpRequestE2eTest {
  protected searcherIds: string[] | undefined;
  protected userSearches: UserSearch[] | undefined;
  protected matchingEngine: MatchingEngine | undefined;

  protected async createMatchingEngine(
    vars: { [key: string]: string }[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendGraphQlRequest<CreateMatchingEngineResponseData>(
      config.createMatchingEngineRequestData,
      vars,
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

  protected async createUserSearches(vars: { [key: string]: string }[]): Promise<void> {
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

  protected async findAllSearchResults(
    vars: { [key: string]: string }[],
  ): Promise<void> {

    if (!Array.isArray(this.userSearches) || this.userSearches.length < 1) {
      logger.warn('BgE2eTestSuite.loadAllSearchResults: no loadSearchResult saved.',
        { test: this, vars });
    }

    await Promise.all(
      this.userSearches!.map((userSearch) => this.findSearchResult(userSearch, vars))
    )
  }

  protected async findSearchResult(
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

  protected async findSearcherIds(
    vars: { [key: string]: string }[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendGraphQlRequest<FindUsersResponseData>(
      config.findUsersRequestData,
      vars,
    );

    if (!Array.isArray(data) || data.length < 1) {
      logger.warn('BgE2eTestSuite.findSearcherIds: none found.',
        { test: this, vars });
      return;
    }

    this.searcherIds = data.map(u => u.id);
  }

  /**
   * Selects this.config.searcherCount searching user IDs using a random pattern.
   * @param vars
   * @protected
   */
  protected async saveResultData(vars: { [key: string]: string }[]): Promise<void> {
    // todo: save result data into file?
  }

  /**
   * Selects this.config.searcherCount searching user IDs using a random pattern.
   * @param vars
   * @protected
   */
  protected selectSearcherIds(vars: { [key: string]: string }[]): void {
    // todo: this.searcherIds = chance.pickset(this.searcherIds(this.config.searcherCount);
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

    // const config = testConfig as MatchStatsE2eTestConfig;
    const castedVars = vars as unknown as { [key: string]: string }[];

    // Steps:
    // 1. Create MatchingEngine object
    // 2. Pull user IDs.
    // 3. Randomly select user IDs (searcherCount)
    // 4. For each userId, call createUserSearch
    // 5. Save search results
    // 6. Stats??
    // 7. Call deleteUserSearch for all searches
    // 8. Call deleteMatchingEngine

    await this.createMatchingEngine(castedVars);
    await this.findSearcherIds(castedVars);
    this.selectSearcherIds(castedVars);
    await this.createUserSearches(castedVars);
    await this.findAllSearchResults(castedVars);
    await this.deleteUserSearches(castedVars);
    await this.deleteMatchingEngine(castedVars);
    await this.saveResultData(castedVars);

    return { results: [] };
  }
}
