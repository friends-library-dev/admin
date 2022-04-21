import { v4 as uuid } from 'uuid';
import client, { gql } from '../../client';
import result from '../result';
import {
  GetFreeOrderRequest,
  GetFreeOrderRequest_request_address as FreeOrderRequestAddress,
  GetFreeOrderRequestVariables,
} from '../../graphql/GetFreeOrderRequest';
import {
  GetPrintJobExploratoryMetadata,
  GetPrintJobExploratoryMetadataVariables,
} from '../../graphql/GetPrintJobExploratoryMetadata';
import {
  CreateOrderWithItems,
  CreateOrderWithItemsVariables,
} from '../../graphql/CreateOrderWithItems';
import { OrderAddress, OrderItem } from '../../types';
import {
  CreateOrderInput,
  CreateOrderItemInput,
  Lang,
  OrderSource,
  PrintJobStatus,
  PrintSize,
} from '../../graphql/globalTypes';
import * as price from '../../lib/price';

/* CreateOrder */

export async function createOrder(
  address: OrderAddress,
  items: OrderItem[],
  email: string,
  requestId: string,
): Promise<Result<UUID>> {
  const metadataResult = await getPrintJobExploratoryMetadata(address, items);
  if (!metadataResult.success) {
    return metadataResult;
  }

  const { shippingInCents, taxesInCents, feesInCents, shippingLevel } =
    metadataResult.value;

  const totalCents = price.subtotal(items) + shippingInCents + taxesInCents + feesInCents;
  const total = price.formatted(totalCents);
  if (!confirm(`Grand total (w/ shipping and taxes) is ${total}. Proceed?`)) {
    return result.error(`User cancelled`);
  }

  const createOrderInput: CreateOrderInput = {
    id: uuid(),
    lang: items.some((i) => i.lang === `es`) ? Lang.es : Lang.en,
    email,
    source: OrderSource.internal,
    addressCity: address.city,
    addressCountry: address.country,
    addressName: address.name,
    addressState: address.state,
    addressStreet: address.street,
    addressStreet2: address.street2 ?? null,
    addressZip: address.zip,
    amount: totalCents,
    shipping: shippingInCents,
    taxes: taxesInCents,
    fees: feesInCents,
    ccFeeOffset: 0, // it's our own credit card, so no need to offset
    printJobStatus: PrintJobStatus.presubmit,
    shippingLevel,
    freeOrderRequestId: requestId.trim() || null,
    paymentId: `internal--complimentary--${uuid().split(`-`).shift()}`,
  };

  const createItemsInput = items.map((item) => {
    const inputItem: CreateOrderItemInput = {
      orderId: createOrderInput.id!,
      editionId: item.editionId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
    return inputItem;
  });

  try {
    const { data } = await client.mutate<
      CreateOrderWithItems,
      CreateOrderWithItemsVariables
    >({
      mutation: MUTATION_CREATE_ORDER_WITH_ITEMS,
      variables: { order: createOrderInput, items: createItemsInput },
    });
    if (!data) {
      return result.error(`Error creating order: response missing data`);
    }
    return result.success(data.order.id);
  } catch (err) {
    return result.error(`Error creating order: ${err}`);
  }
}

const MUTATION_CREATE_ORDER_WITH_ITEMS = gql`
  mutation CreateOrderWithItems(
    $order: CreateOrderInput!
    $items: [CreateOrderItemInput!]!
  ) {
    order: createOrderWithItems(order: $order, items: $items) {
      id
    }
  }
`;

/* GetPrintJobExploratoryMetadata */

export async function isAddressValid(address: OrderAddress): Promise<Result<boolean>> {
  const metadataResult = await getPrintJobExploratoryMetadata(address, [
    { pages: [100], printSize: `m`, quantity: 1 },
  ]);
  return metadataResult.success ? result.success(true) : metadataResult;
}

export async function getPrintJobExploratoryMetadata(
  address: OrderAddress,
  items: Array<Pick<OrderItem, 'pages' | 'printSize' | 'quantity'>>,
): Promise<Result<GetPrintJobExploratoryMetadata['metadata']>> {
  try {
    const { data, error } = await client.query<
      GetPrintJobExploratoryMetadata,
      GetPrintJobExploratoryMetadataVariables
    >({
      query: QUERY_PRINT_JOB_EXPLORATORY_METADATA,
      variables: {
        input: {
          address,
          items: items.map((item) => ({
            volumes: item.pages,
            printSize: item.printSize as PrintSize,
            quantity: item.quantity,
          })),
        },
      },
    });

    if (!data || error) {
      return result.apolloError(error);
    }

    return result.success(data.metadata);
  } catch (err) {
    let error = String(err);
    if (error.includes(`noExploratoryMetadataRetrieved`)) {
      return result.error(`Shipping not possible`);
    }
    return result.error(error);
  }
}

const QUERY_PRINT_JOB_EXPLORATORY_METADATA = gql`
  query GetPrintJobExploratoryMetadata($input: GetPrintJobExploratoryMetadataInput!) {
    metadata: getPrintJobExploratoryMetadata(input: $input) {
      shippingLevel
      shippingInCents
      taxesInCents
      feesInCents
    }
  }
`;

/* GetFreeOrderRequest */

export async function getFreeOrderRequest(
  requestId: string,
): Promise<Result<{ email: string; address: FreeOrderRequestAddress }>> {
  const { data, error } = await client.query<
    GetFreeOrderRequest,
    GetFreeOrderRequestVariables
  >({
    query: QUERY_FREE_ORDER_REQUEST,
    variables: { id: requestId },
  });

  if (!data || error) {
    return result.apolloError(error);
  }

  return result.success({
    email: data.request.email,
    address: data.request.address,
  });
}

const QUERY_FREE_ORDER_REQUEST = gql`
  query GetFreeOrderRequest($id: UUID!) {
    request: getFreeOrderRequest(id: $id) {
      email
      address {
        name
        street
        street2
        city
        state
        zip
        country
      }
    }
  }
`;
