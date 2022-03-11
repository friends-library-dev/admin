/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateFriendQuoteInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateFriendQuote
// ====================================================

export interface CreateFriendQuote_quote {
  __typename: 'FriendQuote';
  id: string;
}

export interface CreateFriendQuote {
  quote: CreateFriendQuote_quote;
}

export interface CreateFriendQuoteVariables {
  input: CreateFriendQuoteInput;
}
