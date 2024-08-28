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

export interface FindUsersResponseData extends GraphqlResponseData {
  data: { findUsers: User[] };
}

export interface MatchingEngine {
  id: string;
}

export interface MatchStatsE2eTestConfig extends JsonHttpRequestE2eTestConfig {
  //createMatchingEngineRequestData: any;
  createUserSearchRequestData: any;
  deleteUserSearchesRequestData: any;
  exportFilePath?: string;
  exportFormat?: 'csv' | 'json';
  findUserSearchResultsRequestData: any;
  findUsersRequestData: any;
}

export interface ResultRecord {
  userId: string;
  rank: number;
  score: number;
}

export interface User {
  id: string;
}

export interface UserSearch {
  id: string;
  searcherId?: string;
  resultRecords?: ResultRecord[] | undefined;
}

export interface UserWithScore {
  id: string;
  score: number;
}
