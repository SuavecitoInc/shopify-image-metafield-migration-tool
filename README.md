# Image Metafield Migration Tool

> This script migrates Shopify image metafields into image array metafields. It also facilitates metafield renaming by assigning a new metafield value based on an existing one.

## Setup

Required Shopify Admin Scopes for Access Token:

- write_product_listings
- write_products

.env

```bash
SHOPIFY_DOMAIN=
SHOPIFY_ADMIN_API_VERSION=2024-07
SHOPIFY_ADMIN_API_TOKEN=
```

## Migrations

Metafield Definitions must be created before running the migration.

## Image Metafield Migration

This migration gets the given file reference type metafields and sets them as values in a file reference list type metafield. The metafields to source and merge are predefined within the queries (fragments).

Product metafields `debut.default_lifestyle_image_1 - 8` will get set to product metafield `suavecito.lifestyle_images`.

Variant metafields `debut.variant_image-1 - 8` will get set to variant metafield `suavecito.images`.

Variant metafields `debut.variant_lifestyle1 - 4` will get set to variant metafield `suavecito.lifestyle_images`.

Run

```bash
npm run images
```

## Rename Metafields Migration

You can't rename a metafield namespace or key directly. This migration copies the value of an existing metafield to a new one. Once the migration is complete, you can safely delete the old metafield and its values. Please make sure the values were set before deleting the old metafields.

A configuration is used to retrieve the old metafield values. The migration updates one product metafield and one variant metafield at a time. If you only need to update a product metafield, set the old variant namespace or key to a non-existent value. This will return null, preventing the variant metafield from being set. The same applies if you're only updating a variant metafield set the old product namespace or key to a non-existent value.

Update the config:

```typescript
const CONFIG = {
  product: {
    old: {
      namespace: 'debut',
      key: 'some_key',
      type: 'boolean',
    },
    new: {
      namespace: 'suavecito',
      key: 'some_key',
      type: 'boolean',
    },
  },
  variant: {
    old: {
      namespace: 'debut',
      key: 'exclude_variant_online',
      type: 'boolean',
    },
    new: {
      namespace: 'suavecito',
      key: 'exclude_variant_online',
      type: 'boolean',
    },
  },
};
```

Run

```bash
npm run rename
```
