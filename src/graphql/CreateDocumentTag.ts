/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateDocumentTagInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateDocumentTag
// ====================================================

export interface CreateDocumentTag_tag {
  __typename: 'DocumentTag';
  id: string;
}

export interface CreateDocumentTag {
  tag: CreateDocumentTag_tag;
}

export interface CreateDocumentTagVariables {
  input: CreateDocumentTagInput;
}
