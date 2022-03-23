import React, { useReducer } from 'react';
import isEqual from 'lodash.isequal';
import { useParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQueryResult } from '../../lib/query';
import {
  EditFriend as EditFriendQuery,
  EditFriendVariables,
} from '../../graphql/EditFriend';
import TextInput from '../TextInput';
import LabeledSelect from '../LabeledSelect';
import { Gender, Lang } from '../../graphql/globalTypes';
import reducer, { isValidYear } from '../../lib/reducer';
import NestedCollection from './NestedCollection';
import { EditDocument } from './EditDocument';
import {
  EDIT_DOCUMENT_FIELDS,
  SELECTABLE_DOCUMENTS_FIELDS,
  writable,
} from '../../client';
import {
  EditableFriend,
  Reducer,
  ReducerReplace,
  SelectableDocuments,
} from '../../types';
import * as empty from '../../lib/empty';
import * as sort from './sort';
import SaveChangesBar from '../SaveChangesBar';
import LabeledToggle from '../LabeledToggle';

interface Props {
  friend: EditableFriend;
  selectableDocuments: SelectableDocuments;
}

export const EditFriend: React.FC<Props> = ({
  friend: initialFriend,
  selectableDocuments,
}) => {
  const [friend, dispatch] = useReducer<Reducer<EditableFriend>>(reducer, initialFriend);
  const replace: ReducerReplace = (path, preprocess) => {
    return (value) =>
      dispatch({
        type: `replace_value`,
        at: path,
        with: preprocess ? preprocess(value) : value,
      });
  };
  const deleteFrom: (path: string) => (index: number) => unknown = (path) => {
    return (index) => dispatch({ type: `delete_item`, at: `${path}[${index}]` });
  };
  return (
    <div className="mt-6 space-y-4 mb-24">
      <SaveChangesBar
        entityName="Friend"
        disabled={isEqual(friend, initialFriend)}
        // @ts-ignore
        getEntities={() => [friend, initialFriend]}
      />
      <div className="flex space-x-4">
        {friend.id.startsWith(`_`) && (
          <LabeledSelect
            label="Lanugage"
            selected={friend.lang}
            setSelected={replace(`lang`)}
            options={[
              [Lang.en, `English`],
              [Lang.es, `Spanish`],
            ]}
          />
        )}
        <TextInput
          type="text"
          label="Name:"
          isValid={(name) => name.length > 5 && !!name.match(/^[A-Z].* [A-Z].*/)}
          invalidMessage="min length 5, first + last at least"
          value={friend.name}
          onChange={replace(`name`)}
          className="flex-grow"
        />
        <TextInput
          type="text"
          label="Slug:"
          isValid={(slug) => slug.length > 5 && !!slug.match(/^([a-z-]+)$/)}
          invalidMessage="min length 5, only lowercase letters and dashes"
          value={friend.slug}
          onChange={replace(`slug`)}
          className="flex-grow"
        />
      </div>
      <div className="flex space-x-4">
        <LabeledSelect
          label="Gender:"
          selected={friend.gender}
          setSelected={replace(`gender`)}
          options={[
            [Gender.male, `male`],
            [Gender.female, `female`],
            [Gender.mixed, `mixed (compilations)`],
          ]}
          className="w-1/2"
        />
        <div className="flex w-1/2 space-x-4">
          <TextInput
            type="number"
            label="Born:"
            isValid={isValidYear}
            value={friend.born === null ? `` : String(friend.born)}
            onChange={(year) => dispatch({ type: `update_year`, at: `born`, with: year })}
            className="w-1/2"
          />
          <TextInput
            type="number"
            label="Died:"
            isValid={isValidYear}
            value={friend.died === null ? `` : String(friend.died)}
            onChange={(year) => dispatch({ type: `update_year`, at: `died`, with: year })}
            className="w-1/2"
          />
          <LabeledToggle
            label="Published:"
            enabled={friend.published !== null}
            setEnabled={(enabled) =>
              replace(`published`)(
                enabled ? initialFriend.published ?? new Date().toISOString() : null,
              )
            }
          />
        </div>
      </div>
      <TextInput
        type="textarea"
        label="Description:"
        value={friend.description}
        onChange={replace(`description`)}
      />
      <NestedCollection
        label="Residence"
        items={friend.residences}
        onAdd={() =>
          dispatch({
            type: `add_item`,
            at: `residences`,
            value: empty.friendResidence(friend),
          })
        }
        onDelete={deleteFrom(`residences`)}
        renderItem={(residence, residenceIndex) => (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <TextInput
                type="text"
                label="City:"
                className="w-2/3"
                value={residence.city}
                onChange={replace(`residences[${residenceIndex}].city`)}
              />
              <LabeledSelect
                label="Region"
                className="w-1/3"
                selected={residence.region}
                setSelected={replace(`residences[${residenceIndex}].region`)}
                options={[
                  [`England`, `England`],
                  [`Ireland`, `Ireland`],
                  [`Pennsylvania`, `Pennsylvania`],
                  [`Scotland`, `Scotland`],
                  [`Wales`, `Wales`],
                  [`Ohio`, `Ohio`],
                  [`Rhode Island `, `Rhode Island`],
                  [`Netherlands`, `Netherlands`],
                  [`New York`, `New York`],
                  [`Delaware`, `Delaware`],
                  [`New Jersey`, `New Jersey`],
                  [`Russia`, `Russia`],
                  [`France`, `France`],
                  [`Vermont`, `Vermont`],
                ]}
              />
            </div>
            <NestedCollection
              label="Duration"
              items={residence.durations}
              onAdd={() =>
                dispatch({
                  type: `add_item`,
                  at: `residences[${residenceIndex}].durations`,
                  value: empty.friendResidenceDuration(residence),
                })
              }
              onDelete={deleteFrom(`residences[${residenceIndex}].durations`)}
              renderItem={(duration, durationIndex) => (
                <div className="flex space-x-4">
                  <TextInput
                    className="w-1/2"
                    type="number"
                    label="Start:"
                    value={String(duration.start)}
                    onChange={replace(
                      `residences[${residenceIndex}].durations[${durationIndex}].start`,
                    )}
                  />
                  <TextInput
                    className="w-1/2"
                    type="number"
                    label="End:"
                    value={String(duration.end)}
                    onChange={replace(
                      `residences[${residenceIndex}].durations[${durationIndex}].end`,
                    )}
                  />
                </div>
              )}
            />
          </div>
        )}
      />
      <NestedCollection
        label="Quote"
        items={friend.quotes}
        onDelete={deleteFrom(`quotes`)}
        onAdd={() =>
          dispatch({
            type: `add_item`,
            at: `quotes`,
            value: empty.friendQuote(friend),
          })
        }
        renderItem={(item, index) => (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <TextInput
                type="text"
                className="flex-grow"
                label="Quote Source:"
                value={item.source}
                onChange={replace(`quotes[${index}].source`)}
              />
              <TextInput
                type="number"
                label="Quote Order:"
                isValid={(input) => Number.isInteger(Number(input))}
                value={String(item.order)}
                onChange={replace(`quotes[${index}].order`, Number)}
              />
            </div>
            <TextInput
              type="textarea"
              textareaSize="h-32"
              label="Quote Text:"
              value={friend.quotes[index]?.text ?? ``}
              onChange={replace(`quotes[${index}].text`)}
            />
          </div>
        )}
      />
      <NestedCollection
        label="Document"
        items={friend.documents}
        onAdd={() =>
          dispatch({
            type: `add_item`,
            at: `documents`,
            value: empty.document(friend),
          })
        }
        onDelete={deleteFrom(`documents`)}
        editLink="/documents/:id"
        renderItem={(item, index) => (
          <EditDocument
            document={item}
            selectableDocuments={selectableDocuments}
            replace={(path) => (value) =>
              dispatch({
                type: `replace_value`,
                at: `documents[${index}].${path}`,
                with: value,
              })}
            deleteItem={(subpath) =>
              dispatch({
                type: `delete_item`,
                at: `documents[${index}].${subpath}`,
              })
            }
            addItem={(subpath, item) =>
              dispatch({
                type: `add_item`,
                at: `documents[${index}].${subpath}`,
                value: item,
              })
            }
          />
        )}
      />
    </div>
  );
};

// container

const EditFriendContainer: React.FC = () => {
  const { id = `` } = useParams<{ id: UUID }>();
  const query = useQueryResult<EditFriendQuery, EditFriendVariables>(QUERY_FRIEND, {
    variables: { id },
  });
  if (!query.isResolved) {
    return query.unresolvedElement;
  }
  return (
    <EditFriend
      friend={sort.friend(writable(query.data.friend))}
      selectableDocuments={query.data.selectableDocuments}
    />
  );
};

export default EditFriendContainer;

const QUERY_FRIEND = gql`
  ${EDIT_DOCUMENT_FIELDS}
  ${SELECTABLE_DOCUMENTS_FIELDS}
  query EditFriend($id: UUID!) {
    friend: getFriend(id: $id) {
      id
      lang
      name
      slug
      gender
      born
      died
      description
      published
      quotes {
        id
        source
        text
        order
        friend {
          id
        }
      }
      documents {
        ...EditDocumentFields
      }
      residences {
        id
        city
        region
        durations {
          id
          start
          end
          residence {
            id
          }
        }
        friend {
          id
        }
      }
    }
    selectableDocuments: getDocuments {
      ...SelectableDocumentsFields
    }
  }
`;
