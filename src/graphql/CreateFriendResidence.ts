/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateFriendResidenceInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateFriendResidence
// ====================================================

export interface CreateFriendResidence_residence {
  __typename: 'FriendResidence';
  id: string;
}

export interface CreateFriendResidence {
  residence: CreateFriendResidence_residence;
}

export interface CreateFriendResidenceVariables {
  input: CreateFriendResidenceInput;
}
