/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateTokenScopeInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateTokenScope
// ====================================================

export interface CreateTokenScope_part {
  __typename: 'IdentifyEntity';
  id: string;
}

export interface CreateTokenScope {
  part: CreateTokenScope_part;
}

export interface CreateTokenScopeVariables {
  input: CreateTokenScopeInput;
}
