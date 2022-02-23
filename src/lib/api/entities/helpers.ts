import { EditableEntity, ErrorMsg } from '../../../types';

export async function mutate<T>(
  type: 'create' | 'update' | 'delete',
  entity: EditableEntity,
  handler: () => Promise<{ data?: T | null | undefined }>,
): Promise<ErrorMsg | null> {
  const verb = type.replace(/e$/, `ing`);
  const entityType = entity.__typename;
  try {
    const { data } = await handler();
    if (!data) {
      return `Unexpected missing data ${verb} ${entityType}`;
    } else {
      return null;
    }
  } catch (err: unknown) {
    return `Error ${verb} ${entityType}: ${err}`;
  }
}

export function nullEmptyString(input: string | null): string | null {
  if (typeof input === `string` && input.trim() === ``) {
    return null;
  }
  return input;
}

export function prepIds<T extends Record<string, unknown>>(record: T): T {
  for (const key of Object.keys(record)) {
    const value = record[key];
    if (isClientGeneratedId(value)) {
      // @ts-ignore
      record[key] = value.replace(/^_/, ``);
    }
  }
  return record;
}

export function swiftDate(input: string | null): string | null {
  if (input === null) return null;
  return input.replace(/:(\d\d)Z$/, `:$1.000Z`);
}

export function isClientGeneratedId(id: unknown): boolean {
  return !!(typeof id === `string` && id.match(MATCH_CLIENT_GENERATED_ID));
}

const MATCH_CLIENT_GENERATED_ID =
  /^_[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
