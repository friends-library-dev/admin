import React, { useReducer, useState } from 'react';
import isEqual from 'lodash.isequal';
import {
  ReducerReplace,
  Reducer,
  EditableDocument,
  SelectableDocuments,
} from '../../types';
import TextInput from '../TextInput';
import { gql } from '@apollo/client';
import { EDIT_DOCUMENT_FIELDS, SELECTABLE_DOCUMENTS_FIELDS } from '../../client';
import { useParams } from 'react-router-dom';
import { useQueryResult } from '../../lib/query';
import {
  EditDocument as EditDocumentQuery,
  EditDocumentVariables as Vars,
} from '../../graphql/EditDocument';
import reducer from './reducer';
import { Lang, TagType } from '../../graphql/globalTypes';
import NestedCollection from './NestedCollection';
import LabeledToggle from '../LabeledToggle';
import EditEdition from './EditEdition';
import * as emptyEntities from '../../lib/empty-entities';
import LabledCheckbox from '../LabledCheckbox';
import LabeledSelect from '../LabeledSelect';
import SaveChangesBar from './SaveChangesBar';

interface Props {
  document: EditableDocument;
  selectableDocuments: SelectableDocuments;
  replace: ReducerReplace;
  deleteItem(path: string): unknown;
  addItem(path: string, item: unknown): unknown;
}

export const EditDocument: React.FC<Props> = ({
  document: doc,
  replace,
  addItem,
  deleteItem,
  selectableDocuments,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <TextInput
          type="text"
          label="Author:"
          value={doc.friend.name}
          disabled
          isValid={(slug) => slug.length > 3 && !!slug.match(/^([a-z-]+)$/)}
          invalidMessage="min length 3, only lowercase letters and dashes"
          onChange={replace(`slug`)}
          className="w-1/2"
        />
        <TextInput
          type="text"
          label={`${
            doc.friend.lang === Lang.en ? `Spanish` : `English`
          } Version Document ID:`}
          value={doc.altLanguageId}
          isValid={(fn) => !!fn.match(/^[A-Z][A-Za-z0-9_]+$/)}
          invalidMessage="Letters, numbers, and underscores only"
          onChange={replace(`filename`)}
          className="w-1/2"
        />
      </div>
      <div className="flex space-x-4">
        <TextInput
          type="text"
          label="Title:"
          value={doc.title}
          onChange={replace(`title`)}
          className="flex-grow"
        />
        <TextInput
          type="number"
          label="Published:"
          placeholder="1600"
          value={String(doc.published ?? ``)}
          onChange={replace(`published`)}
          className="w-[12%]"
        />
        <LabeledToggle
          label="Incomplete:"
          enabled={doc.incomplete}
          setEnabled={replace(`incomplete`)}
        />
      </div>
      <div className="flex space-x-4">
        <TextInput
          type="text"
          label="Slug:"
          value={doc.slug}
          isValid={(slug) => slug.length > 3 && !!slug.match(/^([a-z-]+)$/)}
          invalidMessage="min length 3, only lowercase letters and dashes"
          onChange={replace(`slug`)}
          className="w-1/2"
        />
        <TextInput
          type="text"
          label="Filename:"
          value={doc.filename}
          isValid={(fn) => !!fn.match(/^[A-Z][A-Za-z0-9_]+$/)}
          invalidMessage="Letters, numbers, and underscores only"
          onChange={replace(`filename`)}
          className="w-1/2"
        />
      </div>
      <div className="pt-2 pb-1 space-x-4 flex justify-between">
        <label className="label">Tags:</label>
        {Object.values(TagType).map((tag) => (
          <LabledCheckbox
            key={`${doc.id}--${tag}`}
            id={`${doc.id}--${tag}`}
            label={tag === `spiritualLife` ? `spiritual life` : tag}
            checked={doc.tags.some((t) => t.type === tag)}
            onToggle={(checked) => {
              const tags = [...doc.tags];
              if (checked) {
                tags.push(emptyEntities.documentTag(tag));
              } else {
                const index = tags.findIndex((t) => t.type === tag);
                if (index !== -1) {
                  tags.splice(index, 1);
                }
              }
              replace(`tags`)(tags);
            }}
          />
        ))}
      </div>
      <TextInput
        type="textarea"
        textareaSize="h-24"
        label="Original Title:"
        value={doc.originalTitle}
        onChange={replace(`originalTitle`)}
      />
      <TextInput
        type="textarea"
        textareaSize="h-[12em]"
        label="Description"
        value={doc.description}
        onChange={replace(`description`)}
      />
      <TextInput
        type="textarea"
        textareaSize="h-24"
        label="Partial Description:"
        value={doc.partialDescription}
        onChange={replace(`partialDescription`)}
      />
      <TextInput
        type="textarea"
        textareaSize="h-24"
        label="Featured Description:"
        value={doc.featuredDescription}
        onChange={replace(`featuredDescription`)}
      />
      <NestedCollection
        label="Related Document"
        items={doc.relatedDocuments}
        onAdd={() =>
          replace(`relatedDocuments`)(
            [...doc.relatedDocuments].concat([
              emptyEntities.relatedDocument(
                [...selectableDocuments].sort(sortSelectableDocuments)[0]?.id ?? ``,
              ),
            ]),
          )
        }
        onDelete={(index) => deleteItem(`relatedDocuments[${index}]`)}
        renderItem={(related, index) => (
          <div className="space-y-4">
            <LabeledSelect
              label="Document:"
              selected={related.documentId}
              setSelected={replace(`relatedDocuments[${index}].documentId`)}
              options={[...selectableDocuments]
                .filter((selectableDoc) => selectableDoc.friend.lang === doc.friend.lang)
                .sort(sortSelectableDocuments)
                .map((selectableDoc) => [
                  selectableDoc.id,
                  `${selectableDoc.friend.alphabeticalName}: ${selectableDoc.title}`,
                ])}
            />
            <TextInput
              type="textarea"
              label="Description:"
              textareaSize="h-24"
              value={related.description}
              onChange={replace(`relatedDocuments[${index}].description`)}
            />
          </div>
        )}
      />
      <NestedCollection
        label="Edition"
        items={doc.editions}
        startsCollapsed={false}
        onAdd={() => addItem(`editions`, emptyEntities.edition())}
        onDelete={(index) => deleteItem(`editions[${index}]`)}
        renderItem={(item, index) => (
          <EditEdition
            edition={item}
            replace={(path) => replace(`editions[${index}].${path}`)}
          />
        )}
      />
    </div>
  );
};

// container

const EditDocumentContainer: React.FC = () => {
  const { id = `` } = useParams<{ id: UUID }>();
  const [loaded, setLoaded] = useState(false);
  const [document, dispatch] = useReducer<Reducer<EditableDocument>>(
    reducer,
    null as any,
  );
  const query = useQueryResult<EditDocumentQuery, Vars>(QUERY_DOCUMENT, {
    variables: { id },
  });

  if (!query.isResolved) {
    return query.unresolvedElement;
  }

  if (!loaded) {
    setLoaded(true);
    dispatch({ type: `replace`, state: query.data.document });
  }

  return (
    <>
      <div className="mb-24">
        <EditDocument
          document={document}
          selectableDocuments={query.data.selectableDocuments}
          deleteItem={(path) => dispatch({ type: `delete_item`, at: path })}
          addItem={(path, item) => dispatch({ type: `add_item`, at: path, value: item })}
          replace={(path, preprocess) => (value) =>
            dispatch({
              type: `replace_value`,
              at: path,
              with: preprocess ? preprocess(value) : value,
            })}
        />
      </div>
      <SaveChangesBar
        // @ts-ignore
        getEntities={() => [document, query.data.document]}
        buttonText="Save Document"
        disabled={isEqual(query.data.document, document)}
      />
    </>
  );
};

export default EditDocumentContainer;

const QUERY_DOCUMENT = gql`
  ${EDIT_DOCUMENT_FIELDS}
  ${SELECTABLE_DOCUMENTS_FIELDS}
  query EditDocument($id: UUID!) {
    document: getDocument(id: $id) {
      ...EditDocumentFields
    }
    selectableDocuments: getDocuments {
      ...SelectableDocumentsFields
    }
  }
`;

function sortSelectableDocuments(
  a: SelectableDocuments[0],
  b: SelectableDocuments[0],
): number {
  return a.friend.alphabeticalName < b.friend.alphabeticalName ? -1 : 1;
}
