import { JsonHttpRequestE2eTestConfig } from '../definitions';

export interface GraphqlResponseData {
  errors?: string[];
}

// todo: matchingEngine
/*
export interface CreateMatchingEngineResponseData extends GraphqlResponseData {
  createMatchingEngine: MatchingEngine;
}
*/

export interface CreateUserSearchResponseData extends GraphqlResponseData {
  createUserSearch: UserSearch;
}

// todo: matchingEngine
/*
export interface DeleteMatchingEngineResponseData extends GraphqlResponseData {
  id: string;
}
*/

export interface FindUserSearchResultsResponseData extends GraphqlResponseData {
  findUserSearchResults: UserSearch[];
}

export interface FindUsersResponseData extends GraphqlResponseData {
  data: { findUsers: User[] };
}

// todo: matchingEngine
/*
export interface MatchingEngine {
  id: string;
}
*/

export interface MatchStatsE2eTestConfig extends JsonHttpRequestE2eTestConfig {
  // todo: matchingEngine
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

/*
export interface UserWithScore {
  id: string;
  score: number;
}
*/
