import fetch from 'isomorphic-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import f from 'fs';
import path from 'path';
import csv from 'csv-stringify';

import { ADMIN_API_ENDPOINT, SHOPIFY_ADMIN_API_TOKEN } from './const.js';
import {
  UpdateProductMetafieldsMutation,
  UpdateVariantMetafieldsMutation,
} from './types/admin.generated.js';
import { updateVariantMetafields } from './admin/handlers/mutations/index.js';

dotenv.config();

type JsonResponse<T> = {
  data: T;
  error?: any;
};

export async function shopifyAdmin<T>(
  query: string,
  variables?: object,
): Promise<JsonResponse<T>> {
  try {
    const response = await fetch(ADMIN_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();

    return json as JsonResponse<T>;
  } catch (err: any) {
    console.log('Error fetching data', err);
    throw new Error(err?.message || 'Error fetching data');
  }
}

export async function writeToFile(fileName: string, data: string) {
  const file = path.join(__dirname, `../../../export/${fileName}.json`);
  try {
    await fs.writeFile(file, data);
  } catch (err: any) {
    console.log('Error writing to file', err);
  }
}

export function verifyConfig() {
  const errors: string[] = [];

  if (!SHOPIFY_ADMIN_API_TOKEN) {
    errors.push('Shopify Admin API token is required.');
  }

  if (!ADMIN_API_ENDPOINT) {
    errors.push('Shopify Admin API endpoint is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

type LogData = JsonResponse<
  UpdateProductMetafieldsMutation | UpdateVariantMetafieldsMutation
>;

export function logMetafieldUpdateData(response: LogData) {
  const { data } = response;

  if (!data.metafieldsSet?.metafields) {
    return;
  }

  data.metafieldsSet.metafields.forEach((metafield) => {
    const isProduct = metafield.owner.__typename === 'Product';
    if (isProduct) {
      console.log('------------------------');
      console.log('UPDATED PRODUCT');
      console.log('id:', metafield.owner.id);
      console.log('title:', metafield.owner.title);
      console.log('handle:', metafield.owner.handle);
      console.log('metafield:', metafield.namespace, metafield.key);
      console.log('value:', metafield.value);
      console.log('------------------------');
    } else {
      // is variant
      console.log('------------------------');
      console.log('UPDATED VARIANT');
      console.log('id:', metafield.owner.id);
      console.log('title:', metafield.owner.title);
      console.log('sku:', metafield.owner.sku);
      console.log('metafield:', metafield.namespace, metafield.key);
      console.log('value:', metafield.value);
      console.log('------------------------');
    }
  });
}

export async function createCsvFile(fileName: string, headers: string[]) {
  const file = path.join(__dirname, `../../logs/${fileName}.csv`);

  return new Promise((resolve, reject) => {
    csv.stringify([], { header: true, columns: headers }, (err, output) => {
      if (err) {
        console.log('Error creating CSV file', err);
        reject(err);
      }

      fs.writeFile(file, output)
        .then(() => {
          resolve(file);
        })
        .catch((err) => {
          console.log('Error writing to file', err);
          reject(err);
        });
    });
  });
}

export async function appendCsvFile(fileName: string, data: any[]) {
  const file = path.join(__dirname, `../../logs/${fileName}.csv`);

  return new Promise((resolve, reject) => {
    csv.stringify(data, { header: false }, (err, output) => {
      if (err) {
        console.log('Error creating CSV file', err);
        reject(err);
      }

      fs.appendFile(file, output)
        .then(() => {
          resolve(file);
        })
        .catch((err) => {
          console.log('Error writing to file', err);
          reject(err);
        });
    });
  });
}
