/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateAudioInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateAudio
// ====================================================

export interface CreateAudio_audio {
  __typename: 'Audio';
  id: string;
}

export interface CreateAudio {
  audio: CreateAudio_audio;
}

export interface CreateAudioVariables {
  input: CreateAudioInput;
}
