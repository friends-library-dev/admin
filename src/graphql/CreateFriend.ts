/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateFriendInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateFriend
// ====================================================

export interface CreateFriend_friend {
  __typename: 'Friend';
  id: string;
}

export interface CreateFriend {
  friend: CreateFriend_friend;
}

export interface CreateFriendVariables {
  input: CreateFriendInput;
}
