import { v4 as uuid } from 'uuid';
import { AdminOrderEditionResourceV1 as Edition } from '@friends-library/api';
import { ShippingLevel } from '@friends-library/types';
import { OrderAddress, OrderItem, Result } from '../types';
import gql from '../lib/gql';
import * as price from '../lib/price';

export async function validateToken(token: string): Promise<string | null> {
  const ENDPOINT = import.meta.env.SNOWPACK_PUBLIC_FLP_GRAPHQL_API_ENDPOINT;
  await new Promise((res) => setTimeout(res, 3000));

  try {
    const res = await fetch(ENDPOINT, {
      method: `POST`,
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify({
        query: QUERY_TOKEN,
        variables: { value: token },
      }),
    });

    const json = await res.json();
    if (json.errors) {
      const msg = String(json.errors[0].message);
      if (msg.includes(`404`)) {
        return `Token not found.`;
      }
      return msg;
    }

    if (json.data) {
      for (const scope of json.data.token.scopes) {
        if (scope.name === `mutateOrders`) {
          return null;
        }
      }
      return `Token does not have required permission.`;
    }
  } catch (error: unknown) {
    return String(error);
  }

  return `Unknown error`;
}

export async function createOrder(
  address: OrderAddress,
  items: OrderItem[],
  email: string,
  token: string,
): Promise<Result<string>> {
  const feesResult = await getPrintJobFees(address, items);
  if (!feesResult.success) {
    return feesResult;
  }

  const { shipping, taxes, shippingLevel } = feesResult.value;
  const totalCents = price.subtotal(items) + shipping + taxes;
  const total = price.formatted(totalCents);
  if (!confirm(`Grand total (w/ shipping and taxes) is ${total}. Proceed?`)) {
    return { success: false, error: `User cancelled` };
  }

  const createOrderInput = {
    lang: items.some((i) => i.lang === `es`) ? `es` : `en`,
    email,
    source: `internal`,
    items: items.map((item) => ({
      title: item.orderTitle,
      documentId: item.documentId,
      editionType: item.editionType,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    addressCity: address.city,
    addressCountry: address.country,
    addressName: address.name,
    addressState: address.state,
    addressStreet: address.street,
    addressStreet2: address.street2 ?? null,
    addressZip: address.zip,
    amount: totalCents,
    shipping,
    taxes,
    ccFeeOffset: 0, // it's our own credit card, so no need to offset
    printJobStatus: `presubmit`,
    shippingLevel: shippingLevel.toLowerCase(),
    paymentId: `internal--complimentary--${uuid().split(`-`).shift()}`,
  };

  const ENDPOINT = import.meta.env.SNOWPACK_PUBLIC_FLP_GRAPHQL_API_ENDPOINT;
  try {
    const res = await fetch(ENDPOINT, {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_ORDER,
        variables: { input: createOrderInput },
      }),
    });

    const json = await res.json();
    if (json.errors) {
      return {
        success: false,
        error: json?.errors?.[0]?.message ?? JSON.stringify(json),
      };
    }

    if (json?.data?.order?.id) {
      return { success: true, value: String(json.data.order.id).toLowerCase() };
    }
    return {
      success: false,
      error: `Unexpected response: ${JSON.stringify(json)}`,
    };
  } catch (error: unknown) {
    return { success: false, error: String(error) };
  }
}

export async function getPrintJobFees(
  address: OrderAddress,
  items: Array<Pick<OrderItem, 'pages' | 'printSize' | 'quantity'>>,
): Promise<
  Result<{
    shippingLevel: ShippingLevel;
    shipping: number;
    taxes: number;
    ccFeeOffset: number;
  }>
> {
  const ENDPOINT = import.meta.env.SNOWPACK_PUBLIC_PRINT_JOB_FEES_ENDPOINT;
  try {
    const res = await fetch(ENDPOINT, {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`,
      },
      body: JSON.stringify({
        address,
        items: items.flatMap((item) =>
          item.pages.map((volPages) => ({
            pages: volPages,
            printSize: item.printSize,
            quantity: item.quantity,
          })),
        ),
      }),
    });

    if (res.status === 400) {
      return { success: false, error: `Shipping not possible to address` };
    } else if (res.status !== 200) {
      return { success: false, error: `Unexpected error checking shipping` };
    }

    const json = await res.json();
    return { success: true, value: json };
  } catch (error: unknown) {
    return { success: false, error: String(error) };
  }
}

export async function getEditions(): Promise<Array<Edition & { searchString: string }>> {
  const ENDPOINT = import.meta.env.SNOWPACK_PUBLIC_FLP_REST_API_ENDPOINT;
  const res = await fetch(`${ENDPOINT}/admin-order-editions/v1`);
  const editions = await res.json();
  return editions.map((edition: Edition) => ({
    ...edition,
    searchString: editionSearchString(edition),
  }));
}

function editionSearchString(edition: Edition): string {
  return [
    edition.document.title,
    edition.friend.name,
    edition.type,
    edition.lang === `en` ? `english` : `spanish espanol`,
  ]
    .join(` `)
    .toLowerCase();
}

const QUERY_TOKEN = gql`
  query GetTokenByValue($value: String!) {
    token: getTokenByValue(value: $value) {
      scopes {
        name: scope
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    order: createOrder(input: $input) {
      id
    }
  }
`;

declare global {
  interface ImportMeta {
    env: {
      SNOWPACK_PUBLIC_FLP_REST_API_ENDPOINT: string;
      SNOWPACK_PUBLIC_FLP_GRAPHQL_API_ENDPOINT: string;
      SNOWPACK_PUBLIC_PRINT_JOB_FEES_ENDPOINT: string;
    };
  }
}
