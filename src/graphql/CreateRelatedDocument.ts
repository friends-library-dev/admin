/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateRelatedDocumentInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateRelatedDocument
// ====================================================

export interface CreateRelatedDocument_relatedDocument {
  __typename: 'RelatedDocument';
  id: string;
}

export interface CreateRelatedDocument {
  relatedDocument: CreateRelatedDocument_relatedDocument;
}

export interface CreateRelatedDocumentVariables {
  input: CreateRelatedDocumentInput;
}
