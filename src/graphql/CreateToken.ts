/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateTokenInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateToken
// ====================================================

export interface CreateToken_part {
  __typename: 'IdentifyEntity';
  id: string;
}

export interface CreateToken {
  part: CreateToken_part;
}

export interface CreateTokenVariables {
  input: CreateTokenInput;
}
