import { JsonHttpRequestE2eTestConfig } from '../definitions';

export interface GraphqlResponseData {
  errors?: string[];
}

export interface CreateMatchingEngineResponseData extends GraphqlResponseData {
  createMatchingEngine: MatchingEngine;
}

export interface CreateUserSearchResponseData extends GraphqlResponseData {
  createUserSearch: UserSearch;
}

export interface DeleteMatchingEngineResponseData extends GraphqlResponseData {
  id: string;
}

export interface FindUserSearchResultsResponseData extends GraphqlResponseData {
  findUserSearchResults: UserWithScore[];
}

export interface MatchingEngine {
  id: string;
}

export interface MatchStatsE2eTestConfig extends JsonHttpRequestE2eTestConfig {
  oldestLatestActivityAtForSearchers: string;
  oldestLatestActivityAtForMatches: string;
  searcherCount: number;
  matchesCount: number;
  maxResultCount: number;
  findUsersRequestData: any;
  createMatchingEngineRequestData: any;
  createUserSearchRequestData: any;
  findUserSearchResultsRequestData: any;
  deleteUserSearchesRequestData: any;
}

export interface ResultRecord {
  userId: string;
  score: number;
}

export interface UserSearch {
  id: string;
  searcherId: string;
  resultRecords: ResultRecord[] | undefined;
}

export interface UserWithScore {
  id: string;
  score: number;
}
