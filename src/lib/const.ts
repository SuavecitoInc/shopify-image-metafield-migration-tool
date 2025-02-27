import dotenv from 'dotenv';
dotenv.config();

export const ADMIN_API_ENDPOINT = `https://${process.env.SHOPIFY_DOMAIN}.myshopify.com/admin/api/${process.env.SHOPIFY_ADMIN_API_VERSION}/graphql.json`;

export const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
