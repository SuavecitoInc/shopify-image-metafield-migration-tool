import fetch from 'isomorphic-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

import { ADMIN_API_ENDPOINT, SHOPIFY_ADMIN_API_TOKEN } from './const.js';

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
