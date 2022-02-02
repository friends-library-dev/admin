/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum EditionType {
  modernized = 'modernized',
  original = 'original',
  updated = 'updated',
}

export enum Lang {
  en = 'en',
  es = 'es',
}

export enum OrderSource {
  internal = 'internal',
  website = 'website',
}

export enum PrintJobStatus {
  accepted = 'accepted',
  bricked = 'bricked',
  canceled = 'canceled',
  pending = 'pending',
  presubmit = 'presubmit',
  rejected = 'rejected',
  shipped = 'shipped',
}

export enum PrintSize {
  m = 'm',
  s = 's',
  xl = 'xl',
}

export enum PrintSizeVariant {
  m = 'm',
  s = 's',
  xl = 'xl',
  xlCondensed = 'xlCondensed',
}

export enum ShippingLevel {
  expedited = 'expedited',
  express = 'express',
  ground = 'ground',
  groundBus = 'groundBus',
  groundHd = 'groundHd',
  mail = 'mail',
  priorityMail = 'priorityMail',
}

export interface CreateOrderInput {
  addressCity: string;
  addressCountry: string;
  addressName: string;
  addressState: string;
  addressStreet: string;
  addressStreet2?: string | null;
  addressZip: string;
  amount: number;
  ccFeeOffset: number;
  email: string;
  freeOrderRequestId?: UUID | null;
  id?: UUID | null;
  lang: Lang;
  paymentId: string;
  printJobId?: number | null;
  printJobStatus: PrintJobStatus;
  shipping: number;
  shippingLevel: ShippingLevel;
  source: OrderSource;
  taxes: number;
}

export interface CreateOrderItemInput {
  editionId: UUID;
  id?: UUID | null;
  orderId: UUID;
  quantity: number;
  unitPrice: number;
}

export interface GetPrintJobExploratoryMetadataInput {
  address: ShippingAddressInput;
  items: PrintJobExploratoryItemInput[];
}

export interface PrintJobExploratoryItemInput {
  printSize: PrintSize;
  quantity: number;
  volumes: number[];
}

export interface ShippingAddressInput {
  city: string;
  country: string;
  name: string;
  state: string;
  street: string;
  street2?: string | null;
  zip: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================