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
  E2eVarDataType,
} from '../definitions';
import { GraphqlRequestE2eTest } from '../GraphqlRequestE2eTest';
import logger from '../helpers/logger';

/**
 * Runs a set of user searches for a matching engine and saves the matching data.
 */
export class MatchStatsE2eTest extends GraphqlRequestE2eTest {
  protected searcherIds: string[] | undefined;
  protected userSearches: UserSearch[] | undefined;
  protected matchingEngine: MatchingEngine | undefined;

  public constructor(
    suiteConfig: E2eTestSuiteConfig,
    sequenceConfig: E2eTestSequenceConfig,
    config: E2eTestConfig,
  ) {
    super(suiteConfig, sequenceConfig, config);
  }

  protected async createMatchingEngine(
    vars: E2eTestVar[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendRequest<CreateMatchingEngineResponseData>(
      '',
      0,
      config.createMatchingEngineRequestData,
      vars,
    );

    if (!data) {
      throw new Error('create-matching-engine-error');
    }

    this.matchingEngine = data.createMatchingEngine;
  }

  protected async createUserSearch(
    searcherId: string,
    vars: E2eTestVar[],
  ): Promise<UserSearch> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendRequest<CreateUserSearchResponseData>(
      '',
      0,
      config.createUserSearchRequestData,
      vars.concat([{
        name: 'createdBy',
        dataType: E2eVarDataType.string,
        value: searcherId
      }]),
    );

    if (!data) {
      throw new Error('create-user-search-error');
    }

    return data.createUserSearch;
  }

  protected async createUserSearches(vars: E2eTestVar[]): Promise<void> {
    this.searcherIds = [];
    this.userSearches = await Promise.all(
      this.searcherIds.map((searcherId) => this.createUserSearch(searcherId, vars))
    );
  }

  protected async deleteMatchingEngine(
    vars: E2eTestVar[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    if (!this.matchingEngine) {
      logger.warn('BgE2eTestSuite.deleteMatchingEngine: this.matchingEngine not set.',
        { test: this, vars });
      return;
    }

    await this.sendRequest<DeleteMatchingEngineResponseData>(
      '',
      0,
      config.createMatchingEngineRequestData,
      vars.concat([{
        name: 'id',
        dataType: E2eVarDataType.string,
        value: this.matchingEngine.id
      }]),
    );

    this.matchingEngine = undefined;
  }

  protected async deleteUserSearches(
    vars: E2eTestVar[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    if (!Array.isArray(this.userSearches) || this.userSearches.length < 1) {
      logger.warn('BgE2eTestSuite.deleteUserSearches: no userSearches saved.',
        { test: this, vars });
    }

    const clazz = this;
    await Promise.all(
      this.userSearches!.map((userSearch) => {
        return clazz.sendRequest<FindUserSearchResultsResponseData>(
          '',
          0,
          config.deleteUserSearchesRequestData,
          vars.concat({
            name: 'userSearchId',
            dataType: E2eVarDataType.string,
            value: userSearch.id,
          }),
        );
      })
    );

    this.userSearches = undefined;
  }

  protected async findAllSearchResults(
    vars: E2eTestVar[],
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
    vars: E2eTestVar[],
  ): Promise<UserWithScore[]> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendRequest<FindUserSearchResultsResponseData>(
      '',
      0,
      config.findUserSearchResultsRequestData,
      vars.concat({
        name: 'userSearchId',
        dataType: E2eVarDataType.string,
        value: userSearch.id
      }),
    );

    if (!Array.isArray(data) || data.length < 1) {
      return [];
    }

    userSearch.resultRecords = [];

    data.forEach((record, index) => {
      userSearch.resultRecords!.push({
        userId: record.id,
        rank: index,
        score: record.score,
      })
    })

    return data.findUserSearchResults;
  }

  protected async findSearcherIds(
    vars: E2eTestVar[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data } = await this.sendRequest<FindUsersResponseData>(
      '',
      0,
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
  protected async saveResultData(vars: E2eTestVar[]): Promise<void> {
    // todo: save result data into file?
  }

  /**
   * Selects this.config.searcherCount searching user IDs using a random pattern.
   * @param vars
   * @protected
   */
  protected selectSearcherIds(vars: E2eTestVar[]): void {
    // todo: this.searcherIds = chance.pickset(this.searcherIds(this.config.searcherCount);
  }

  protected async runOnce(
    testName: string,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse> {
    logger.trace('MatchStatsE2eTest.runOnce called',
      { test: this });

    // const config = testConfig as MatchStatsE2eTestConfig;

    // Steps:
    // 1. Create MatchingEngine object
    // 2. Pull user IDs.
    // 3. Randomly select user IDs (searcherCount)
    // 4. For each userId, call createUserSearch
    // 5. Save search results
    // 6. Stats??
    // 7. Call deleteUserSearch for all searches
    // 8. Call deleteMatchingEngine

    await this.createMatchingEngine(vars);
    await this.findSearcherIds(vars);
    this.selectSearcherIds(vars);
    await this.createUserSearches(vars);
    await this.findAllSearchResults(vars);
    await this.deleteUserSearches(vars);
    await this.deleteMatchingEngine(vars);
    await this.saveResultData(vars);

    return { results: [] };
  }
}
