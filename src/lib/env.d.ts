declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      SHOPIFY_DOMAIN: string;
      SHOPIFY_ADMIN_API_VERSION: string;
      SHOPIFY_ADMIN_API_TOKEN: string;
    }
  }
}

export {};
