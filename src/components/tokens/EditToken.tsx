import React, { useReducer, useState } from 'react';
import isEqual from 'lodash.isequal';
import { useParams } from 'react-router-dom';
import { useQueryResult } from '../../lib/query';
import { gql, writable } from '../../client';
import { EditToken as EditTokenQuery } from '../../graphql/EditToken';
import TextInput from '../TextInput';
import { Scope as TokenScope } from '../../graphql/globalTypes';
import LabledCheckbox from '../LabledCheckbox';
import { EditableToken, Reducer, ReducerReplace } from '../../types';
import reducer from '../../lib/reducer';
import SaveChangesBar from '../SaveChangesBar';
import * as empty from '../../lib/empty';
import { isClientGeneratedId } from '../../lib/api/entities/helpers';

interface Props {
  token: EditableToken;
}

export const EditToken: React.FC<Props> = ({ token: initialToken }) => {
  const [valueRedacted, setValueRedacted] = useState(
    !isClientGeneratedId(initialToken.id),
  );
  const [token, dispatch] = useReducer<Reducer<EditableToken>>(reducer, initialToken);
  const replace: ReducerReplace = (path, preprocess) => {
    return (value) =>
      dispatch({
        type: `replace_value`,
        at: path,
        with: preprocess ? preprocess(value) : value,
      });
  };
  return (
    <div className="mt-6 space-y-4 mb-24">
      <SaveChangesBar
        entityName="Token"
        // @ts-ignore
        getEntities={() => [token, initialToken]}
        disabled={isEqual(token, initialToken) && !isClientGeneratedId(token.id)}
      />
      <TextInput
        type="text"
        label="Description:"
        value={token.description}
        isValid={(input) => input.length > 3}
        onChange={replace(`description`)}
      />
      <div className="flex space-x-4" onDoubleClick={() => setValueRedacted(false)}>
        <div className="flex-grow">
          <TextInput
            type="text"
            label="Value:"
            value={valueRedacted ? `••••••••••••••••••••••••••••••••••••` : token.value}
            disabled={valueRedacted}
            onChange={() => {}}
          />
        </div>
        <TextInput
          className="w-[18%]"
          type="text"
          label="Uses:"
          value={token.uses ? String(token.uses) : `(unlimited)`}
          disabled
          onChange={() => {}}
        />
        <TextInput
          className="w-[31%]"
          type="text"
          label="Created:"
          value={token.createdAt}
          disabled
          onChange={() => {}}
        />
      </div>
      <div>
        <div className="label">Scopes:</div>
        <div className="space-y-3 mt-3 pl-6">
          {sortScopes(Object.keys(TokenScope) as TokenScope[]).map((scope) => (
            <LabledCheckbox
              className="block"
              key={scope}
              id={scope}
              label={scope.replace(/^(query|mutate)/, `$1 `)}
              checked={token.scopes.some((currentScope) => scope === currentScope.type)}
              onToggle={(checked) => {
                const scopes = [...token.scopes];
                if (checked) {
                  const initialIndex = initialToken.scopes.findIndex(
                    (s) => s.type === scope,
                  );
                  if (initialIndex !== -1) {
                    scopes.splice(
                      initialIndex,
                      0,
                      writable(initialToken.scopes[initialIndex]!),
                    );
                  } else {
                    scopes.push(empty.tokenScope(token.id, scope));
                  }
                } else {
                  const index = scopes.findIndex((s) => s.type === scope);
                  if (index !== -1) {
                    scopes.splice(index, 1);
                  }
                }
                replace(`scopes`)(scopes);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const EditTokenContainer: React.FC = () => {
  const { id = `` } = useParams<{ id: UUID }>();
  const query = useQueryResult<EditTokenQuery>(QUERY_TOKEN, {
    variables: { id },
  });
  if (!query.isResolved) {
    return query.unresolvedElement;
  }
  return <EditToken token={writable(query.data.token)} />;
};

function sortScopes(scopes: TokenScope[]): TokenScope[] {
  return scopes.sort((a, b) => {
    const [aVerb, aEntity, aIsAll] = scopeParts(a);
    const [bVerb, bEntity, bIsAll] = scopeParts(b);
    if (aIsAll || bIsAll) {
      return 1;
    }

    // this is clearly flawed, i was trying to line up entities
    // but i haven't had a good night sleep in 7 days...
    return `${aEntity} ${aVerb}` > `${bEntity} ${bVerb}` ? -1 : 1;
  });
}

function scopeParts(scope: TokenScope): [verb: string, entity: string, isAll: boolean] {
  if (scope.startsWith(`mutate`)) {
    return [`mutate`, scope.replace(/^mutate/, ``), false];
  } else if (scope.startsWith(`query`)) {
    return [`query`, scope.replace(/^mutate/, ``), false];
  } else {
    return [`query and mutate`, `All Entities`, true];
  }
}

export default EditTokenContainer;

const QUERY_TOKEN = gql`
  query EditToken($id: UUID!) {
    token: getToken(id: $id) {
      id
      value
      description
      createdAt
      uses
      scopes {
        id
        type: scope
        token {
          id
        }
      }
    }
  }
`;
