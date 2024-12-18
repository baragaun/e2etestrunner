import Chance from 'chance';
import fs from 'fs';
import Moment from 'moment/moment';
import replaceVars from '../helpers/replaceVars';

import {
  CreateUserSearchResponseData,
  FindUserSearchResultsResponseData,
  FindUsersResponseData,
  MatchStatsE2eTestConfig, ResultRecord,
  UserSearch,
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
import fetchJsonAxios from '../helpers/fetchJsonAxios';

// @ts-ignore
const chance = new Chance();

/**
 * Runs a set of user searches for a matching engine and saves the matching data.
 */
export class MatchStatsE2eTest extends GraphqlRequestE2eTest {
  protected searcherIds: string[] | undefined;
  protected userSearches: UserSearch[] | undefined;
  //protected matchingEngine: MatchingEngine | undefined;

  public constructor(
    suiteConfig: E2eTestSuiteConfig,
    sequenceConfig: E2eTestSequenceConfig,
    config: E2eTestConfig,
  ) {
    super(suiteConfig, sequenceConfig, config);
  }

  /*
  // todo: implement createMatchingEngine
  protected async createMatchingEngine(
    vars: E2eTestVar[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    const { data, errors } = await this.sendRequest<CreateMatchingEngineResponseData>(
      '',
      0,
      config.createMatchingEngineRequestData,
      vars,
    );

    if (!data || errors) {
      throw new Error('create-matching-engine-error');
    }

    this.matchingEngine = data.createMatchingEngine;
  }
  */

  protected async createUserSearch(
    searcherId: string,
    vars: E2eTestVar[],
  ): Promise<UserSearch> {
    const config = this.config as MatchStatsE2eTestConfig;

    // todo: fix template type
    const { data, errors } = await this.sendRequest<any>(
      '',
      0,
      config.createUserSearchRequestData,
      vars.concat([
        {
          name: 'createdBy',
          dataType: E2eVarDataType.string,
          value: searcherId
        },
      ]),
    );

    if (!data || errors) {
      throw new Error('create-user-search-error');
    }

    return { id: data.data.createUserSearch.id, searcherId: searcherId } as UserSearch;
  }

  protected async createUserSearches(vars: E2eTestVar[]): Promise<void> {
    if (!Array.isArray(this.searcherIds) || this.searcherIds.length < 1) {
      logger.error('MatchStatsE2eTest.createUserSearches: No searcherIds.')
      return;
    }

    this.userSearches = await Promise.all(
      this.searcherIds.map((searcherId) => this.createUserSearch(searcherId, vars))
    );
  }

  // todo: matchingEngine
  /*
  protected async deleteMatchingEngine(
    vars: E2eTestVar[],
  ): Promise<void> {
    // const config = this.config as MatchStatsE2eTestConfig;
    //
    // if (!this.matchingEngine) {
    //   logger.warn('BgE2eTestSuite.deleteMatchingEngine: this.matchingEngine not set.',
    //     { test: this, vars });
    //   return;
    // }
    //
    // await this.sendRequest<DeleteMatchingEngineResponseData>(
    //   '',
    //   0,
    //   config.deleteMatchingEngineRequestData,
    //   vars.concat([{
    //     name: 'id',
    //     dataType: E2eVarDataType.string,
    //     value: this.matchingEngine.id
    //   }]),
    // );
    //
    // this.matchingEngine = undefined;
  }
   */

  /*
  protected async deleteUserSearches(
    vars: E2eTestVar[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    if (!this.userSearches || !Array.isArray(this.userSearches) || this.userSearches.length < 1) {
      logger.error('BgE2eTestSuite.deleteUserSearches: no userSearches saved.',
        { test: this, vars });
      return;
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
  */

  protected async findAllSearchResults(
    vars: E2eTestVar[],
  ): Promise<void> {

    if (!this.userSearches || !Array.isArray(this.userSearches) || this.userSearches.length < 1) {
      logger.error('BgE2eTestSuite.loadAllSearchResults: no loadSearchResult saved.',
        { test: this, vars });
      return;
    }

    await Promise.all(
      this.userSearches.map((userSearch) => this.findSearchResult(userSearch, vars))
    )
  }

  protected async findSearchResult(
    userSearch: UserSearch,
    vars: E2eTestVar[],
  ): Promise<UserSearch> {
    const config = this.config as MatchStatsE2eTestConfig;

    /*
    const { data, errors } = await this.sendRequest<FindUserSearchResultsResponseData>(
      '',
      0,
      config.findUserSearchResultsRequestData,
      vars.concat({
        name: 'userSearchId',
        dataType: E2eVarDataType.string,
        value: userSearch.id
      }),
    );
     */

    const { response, error } = await fetchJsonAxios({
      method: config.method,
      url: config.endpoint,
      headers: config.headers,
      data: replaceVars(config.findUserSearchResultsRequestData, vars.concat({
        name: 'userSearchId',
        dataType: E2eVarDataType.string,
        value: userSearch.id
      }))
    })

    userSearch.resultRecords = [];

    const userSearchResults = response?.data.data.findUserSearchResults;

    if (!Array.isArray(userSearchResults) || userSearchResults.length < 1 || error) {
      logger.error('BgE2eTestSuite.findSearchResult: searchResult not found', {
        test: this,
        vars,
        userSearchId: userSearch.id
      });
      return userSearch;
    }

    userSearchResults?.forEach((record, index) => {
      userSearch.resultRecords!.push({
        userId: record.id,
        rank: index,
        score: record.score,
      })
    })

    return userSearch;
  }

  protected async findSearcherIds(
    vars: E2eTestVar[],
  ): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;
    const latestActivityVar = config.vars!.find(c => c.name === 'oldestLatestActivityAtForSearchersInDays')

    const { data, errors } = await this.sendRequest<FindUsersResponseData>(
      '',
      0,
      config.findUsersRequestData,
      (vars || []).concat([{
          name: 'latestActivityAtGreaterThan',
          dataType: E2eVarDataType.string,
          value: Moment().subtract(latestActivityVar?.value as number || 30, 'days').toISOString(),
        }],
      ),
    );

    if (!Array.isArray(data?.data.findUsers) || data.data.findUsers.length < 1 || errors) {
      logger.warn('BgE2eTestSuite.findSearcherIds: none found.',
        { test: this, vars });
      return;
    }

    this.searcherIds = data.data.findUsers.map(u => u.id);
  }

  /**
   * Selects this.config.searcherCount searching user IDs using a random pattern.
   * @param vars
   * @protected
   */
  protected async exportToFile(vars: E2eTestVar[]): Promise<void> {
    const config = this.config as MatchStatsE2eTestConfig;

    if (!Array.isArray(this.userSearches) || this.userSearches.length < 0) {
      logger.warn('BgE2eTestSuite.saveResultData: this.userSearches is empty.',
        { test: this, vars });
      return;
    }

    if (!config.exportFilePath) {
      logger.error('BgE2eTestSuite.saveResultData: no export file path set.',
        { test: this, vars });
      return;
    }

    let exportContent: string | undefined;
    const lines: string[] = ['User1, User2, Rank, Score'];

    if (!config.exportFormat || config.exportFormat === 'csv') {
      for (const search of this.userSearches) {
        if (Array.isArray(search.resultRecords)) {
          for (const match of search.resultRecords) {
            lines.push(`${search.searcherId}, ${match.userId}, ${match.rank}, ${match.score}`);
          }
        }
      }
      exportContent = lines.join("\n");
    } else if (config.exportFormat === 'json') {
      exportContent = JSON.stringify(this.userSearches, null, 2);
    }

    if (!exportContent) {
      logger.warn('BgE2eTestSuite.saveResultData: invalid export format.',
        { test: this, vars });
      return;
    }

    fs.writeFileSync(config.exportFilePath, exportContent);
  }

  /**
   * Selects this.config.searcherCount searching user IDs using a random pattern.
   * @param vars
   * @protected
   */
  protected selectSearcherIds(vars: E2eTestVar[]): void {
    const config = this.config as MatchStatsE2eTestConfig;

    if (!Array.isArray(this.searcherIds) || this.searcherIds.length < 1) {
      logger.error('MatchStatsE2eTest.selectSearcherIds: no searcherIds available.',
        { test: this });
      return;
    }


    const searcherCount = this.config!.vars!.find((e) => e.name === 'searcherCount')?.value as number;
    if (!searcherCount || searcherCount < 1) {
      logger.error('MatchStatsE2eTest.selectSearcherIds: config.searcherCount not set.',
        { test: this });
      return;
    }

    logger.trace('MatchStatsE2eTest.selectSearcherIds: picking a random set of searcherIds.',
      { test: this, originalSearcherIdsCount: this.searcherIds.length });

    this.searcherIds = chance.pickset(this.searcherIds, searcherCount);
  }

  protected async runOnce(
    testName: string,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse> {
    logger.trace('MatchStatsE2eTest.runOnce called',
      { test: this });

    // Steps:
    // 1. Create MatchingEngine object
    // 2. Pull user IDs.
    // 3. Randomly select user IDs (searcherCount)
    // 4. For each userId, call createUserSearch
    // 5. Save search results
    // 6. Stats??
    // 7. Call deleteUserSearch for all searches
    // 8. Call deleteMatchingEngine

    // await this.createMatchingEngine(vars);
    await this.findSearcherIds(vars);
    this.selectSearcherIds(vars);
    await this.createUserSearches(vars);
    await this.findAllSearchResults(vars);
    //await this.deleteUserSearches(vars);
    // await this.deleteMatchingEngine(vars);
    await this.exportToFile(vars);

    return { results: [] };
  }
}
