/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateFriendResidenceDurationInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateFriendResidenceDuration
// ====================================================

export interface CreateFriendResidenceDuration_duration {
  __typename: 'IdentifyEntity';
  id: string;
}

export interface CreateFriendResidenceDuration {
  duration: CreateFriendResidenceDuration_duration;
}

export interface CreateFriendResidenceDurationVariables {
  input: CreateFriendResidenceDurationInput;
}
