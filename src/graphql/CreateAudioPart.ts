/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateAudioPartInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateAudioPart
// ====================================================

export interface CreateAudioPart_part {
  __typename: 'IdentifyEntity';
  id: string;
}

export interface CreateAudioPart {
  part: CreateAudioPart_part;
}

export interface CreateAudioPartVariables {
  input: CreateAudioPartInput;
}
