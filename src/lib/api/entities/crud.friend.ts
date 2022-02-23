import { gql } from '@apollo/client';
import client from '../../../client';
import { CreateFriend, CreateFriendVariables } from '../../../graphql/CreateFriend';
import { DeleteFriend, DeleteFriendVariables } from '../../../graphql/DeleteFriend';
import { UpdateFriendInput } from '../../../graphql/globalTypes';
import { UpdateFriend, UpdateFriendVariables } from '../../../graphql/UpdateFriend';
import { EditableFriend, ErrorMsg } from '../../../types';
import { mutate, prepIds, swiftDate } from './helpers';

export async function create(friend: EditableFriend): Promise<ErrorMsg | null> {
  return mutate(`create`, friend, () =>
    client.mutate<CreateFriend, CreateFriendVariables>({
      mutation: CREATE_FRIEND,
      variables: { input: friendInput(friend) },
    }),
  );
}

export async function update(friend: EditableFriend): Promise<ErrorMsg | null> {
  return mutate(`update`, friend, () =>
    client.mutate<UpdateFriend, UpdateFriendVariables>({
      mutation: UPDATE_FRIEND,
      variables: { input: friendInput(friend) },
    }),
  );
}

export async function remove(friend: EditableFriend): Promise<ErrorMsg | null> {
  return mutate(`delete`, friend, () =>
    client.mutate<DeleteFriend, DeleteFriendVariables>({
      mutation: DELETE_FRIEND,
      variables: { id: friend.id },
    }),
  );
}

export { remove as delete };

// mutations

const CREATE_FRIEND = gql`
  mutation CreateFriend($input: CreateFriendInput!) {
    friend: createFriend(input: $input) {
      id
    }
  }
`;

const UPDATE_FRIEND = gql`
  mutation UpdateFriend($input: UpdateFriendInput!) {
    friend: updateFriend(input: $input) {
      id
    }
  }
`;

const DELETE_FRIEND = gql`
  mutation DeleteFriend($id: UUID!) {
    friend: deleteFriend(id: $id) {
      id
    }
  }
`;

// helpers

function friendInput(friend: EditableFriend): UpdateFriendInput {
  return prepIds({
    born: friend.born,
    description: friend.description,
    died: friend.died,
    gender: friend.gender,
    id: friend.id,
    lang: friend.lang,
    name: friend.name,
    published: swiftDate(friend.published),
    slug: friend.slug,
  });
}
