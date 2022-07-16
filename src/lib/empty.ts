import { v4 as uuid } from 'uuid';
import { EditionType, Gender, Lang, Scope as TokenScope } from '../graphql/globalTypes';
import {
  EditableFriendQuote,
  EditableDocument,
  EditableEdition,
  EditableFriend,
  EditableFriendResidence,
  EditableFriendResidenceDuration,
  EditableRelatedDocument,
  EditableDocumentTag,
  EditableAudio,
  EditableAudioPart,
  EditableToken,
  EditableTokenScope,
} from '../types';

export function friend(): EditableFriend {
  return {
    __typename: `Friend`,
    lang: Lang.en,
    id: clientGeneratedId(),
    name: ``,
    slug: ``,
    born: null,
    died: null,
    gender: Gender.male,
    description: ``,
    published: null,
    quotes: [],
    documents: [],
    residences: [],
  };
}

export function friendQuote(friend: EditableFriend): EditableFriendQuote {
  return {
    __typename: `FriendQuote`,
    id: clientGeneratedId(),
    source: ``,
    text: ``,
    friend: {
      __typename: `Friend`,
      id: friend.id,
    },
    order: Math.max(0, ...friend.quotes.map((q) => q.order)) + 1,
  };
}

export function edition(documentId: UUID): EditableEdition {
  return {
    __typename: `Edition`,
    id: clientGeneratedId(),
    isDraft: true,
    type: EditionType.updated,
    paperbackOverrideSize: null,
    paperbackSplits: null,
    isbn: null,
    editor: null,
    audio: null,
    document: {
      __typename: `Document`,
      id: documentId,
    },
  };
}

export function audio(editionId: UUID): EditableAudio {
  return {
    __typename: `Audio`,
    id: clientGeneratedId(),
    reader: `Jessie Henderson`,
    isIncomplete: false,
    m4bSizeHq: 0,
    m4bSizeLq: 0,
    mp3ZipSizeHq: 0,
    mp3ZipSizeLq: 0,
    externalPlaylistIdHq: null,
    externalPlaylistIdLq: null,
    parts: [],
    edition: {
      __typename: `Edition`,
      id: editionId,
    },
  };
}

export function audioPart(audio: EditableAudio): EditableAudioPart {
  return {
    __typename: `AudioPart`,
    id: clientGeneratedId(),
    order: Math.max(0, ...audio.parts.map((part) => part.order)) + 1,
    title: ``,
    duration: 0,
    chapters: [0],
    mp3SizeHq: 0,
    mp3SizeLq: 0,
    externalIdHq: 0,
    externalIdLq: 0,
    audio: {
      __typename: `Audio`,
      id: audio.id,
    },
  };
}

export function friendResidence(friend: EditableFriend): EditableFriendResidence {
  return {
    __typename: `FriendResidence`,
    id: clientGeneratedId(),
    city: ``,
    region: `England`,
    durations: [],
    friend: {
      __typename: `Friend`,
      id: friend.id,
    },
  };
}

export function friendResidenceDuration(
  residence: EditableFriendResidence,
): EditableFriendResidenceDuration {
  return {
    __typename: `FriendResidenceDuration`,
    id: clientGeneratedId(),
    residence: {
      __typename: `FriendResidence`,
      id: residence.id,
    },
    start: 1600,
    end: 1700,
  };
}

export function relatedDocument(
  documentId: UUID,
  parentDocumentId: UUID,
): EditableRelatedDocument {
  return {
    __typename: `RelatedDocument`,
    id: clientGeneratedId(),
    description: ``,
    document: {
      __typename: `Document`,
      id: documentId,
    },
    parentDocument: {
      __typename: `Document`,
      id: parentDocumentId,
    },
  };
}

export function document(friend: EditableFriend): EditableDocument {
  return {
    __typename: `Document`,
    id: clientGeneratedId(),
    slug: ``,
    description: ``,
    title: ``,
    filename: ``,
    incomplete: false,
    originalTitle: ``,
    partialDescription: ``,
    featuredDescription: null,
    published: null,
    friend: {
      __typename: `Friend`,
      id: friend.id,
      lang: friend.lang,
      name: friend.name,
    },
    editions: [],
    altLanguageId: null,
    tags: [],
    relatedDocuments: [],
  };
}

export function documentTag(
  type: EditableDocumentTag['type'],
  document: EditableDocument,
): EditableDocumentTag {
  return {
    __typename: `DocumentTag`,
    id: clientGeneratedId(),
    type,
    document: {
      __typename: `Document`,
      id: document.id,
    },
  };
}

export function token(): EditableToken {
  return {
    __typename: `Token`,
    id: clientGeneratedId(),
    createdAt: new Date().toISOString(),
    description: ``,
    value: uuid(),
    uses: null,
    scopes: [],
  };
}

export function tokenScope(tokenId: UUID, type: TokenScope): EditableTokenScope {
  return {
    __typename: `TokenScope`,
    id: clientGeneratedId(),
    type,
    token: {
      __typename: `Token`,
      id: tokenId,
    },
  };
}

function clientGeneratedId(): string {
  return `_${uuid()}`;
}
