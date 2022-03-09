import { gql } from '@apollo/client';
import { getClient, writable } from '@friends-library/db';

const token = localStorage.getItem(`token`);

export default getClient({
  env: `infer_web`,
  href: window.location.href,
  ...(token ? { token } : {}),
});

export { gql, writable };

export const SELECTABLE_DOCUMENTS_FIELDS = gql`
  fragment SelectableDocumentsFields on Document {
    id
    title
    friend {
      lang
      alphabeticalName
    }
  }
`;

export const EDIT_EDITION_FIELDS = gql`
  fragment EditEditionFields on Edition {
    id
    type
    paperbackSplits
    paperbackOverrideSize
    editor
    isbn {
      code
    }
    isDraft
    document {
      id
    }
    audio {
      id
      reader
      isIncomplete
      mp3ZipSizeHq
      mp3ZipSizeLq
      m4bSizeHq
      m4bSizeLq
      externalPlaylistIdHq
      externalPlaylistIdLq
      edition {
        id
      }
      parts {
        id
        order
        title
        duration
        chapters
        mp3SizeHq
        mp3SizeLq
        externalIdHq
        externalIdLq
        audio {
          id
        }
      }
    }
  }
`;

export const EDIT_DOCUMENT_FIELDS = gql`
  ${EDIT_EDITION_FIELDS}
  fragment EditDocumentFields on Document {
    id
    altLanguageId
    title
    slug
    filename
    published
    originalTitle
    incomplete
    description
    partialDescription
    featuredDescription
    friend {
      id
      name
      lang
    }
    editions {
      ...EditEditionFields
    }
    tags {
      id
      type
      document {
        id
      }
    }
    relatedDocuments {
      id
      description
      document {
        id
      }
      parentDocument {
        id
      }
    }
  }
`;
