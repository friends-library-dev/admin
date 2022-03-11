/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateDocumentInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateDocument
// ====================================================

export interface CreateDocument_document {
  __typename: 'Document';
  id: string;
}

export interface CreateDocument {
  document: CreateDocument_document;
}

export interface CreateDocumentVariables {
  input: CreateDocumentInput;
}
