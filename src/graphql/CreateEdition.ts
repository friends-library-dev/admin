/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateEditionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateEdition
// ====================================================

export interface CreateEdition_edition {
  __typename: 'IdentifyEntity';
  id: string;
}

export interface CreateEdition {
  edition: CreateEdition_edition;
}

export interface CreateEditionVariables {
  input: CreateEditionInput;
}
