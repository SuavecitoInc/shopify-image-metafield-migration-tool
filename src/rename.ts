import type {
  UpdateProductMetafieldsMutation,
  UpdateVariantMetafieldsMutation,
  ProductsWithMetafieldsQuery,
  ProductWithMetafieldsQuery,
} from './lib/types/admin.generated';
import {
  shopifyAdmin,
  verifyConfig,
  createCsvFile,
  appendCsvFile,
  logMetafieldUpdateData,
} from './lib/utils';
import {
  getProductsWithMetafields as GetProductsWithMetafields,
  getProductWithMetafields as GetProductWithMetafields,
} from './lib/admin/handlers/queries';
import {
  updateVariantMetafields as MutationUpdateVariantMetafields,
  updateProductMetafields as MutationUpdateProductMetafields,
} from './lib/admin/handlers/mutations';

// https://shopify.dev/docs/apps/build/custom-data/metafields/list-of-data-types
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
      key: 'variant_fragrance_profile',
      type: 'single_line_text_field', // boolean | single_line_text_field | rich_text_field
    },
    new: {
      namespace: 'suavecito',
      key: 'option_profile',
      type: 'single_line_text_field', // boolean | single_line_text_field | rich_text_field
    },
  },
};

type Products = ProductsWithMetafieldsQuery['products']['edges'];
type Product = Products[0]['node'];
// type Variant = Product['variants']['edges'][0]['node'];
type MetafieldType = 'PRODUCT' | 'VARIANT';
type Metafield = {
  metafieldType: MetafieldType;
  namespace: string;
  key: string;
  type: string;
  value: string;
};

let productsFilename = 'renamed-product-metafields_';
let variantsFilename = 'renamed-variant-metafields_';

async function updateProductMetafields(
  metafields: {
    namespace: string;
    key: string;
    type: string;
    value: string;
  }[],
  ownerId: string,
) {
  const response = await shopifyAdmin<UpdateProductMetafieldsMutation>(
    MutationUpdateProductMetafields,
    {
      metafields: metafields.map((metafield) => ({
        namespace: metafield.namespace,
        key: metafield.key,
        ownerId,
        type: metafield.type,
        value: metafield.value,
      })),
    },
  );

  if (response.error) {
    console.log('ERROR', response.error);
    return null;
  }

  if (!response.data) {
    console.log('NO DATA', response);
    return null;
  }

  return response;
}

async function updateVariantMetafields(
  metafields: {
    namespace: string;
    key: string;
    type: string;
    value: string;
  }[],
  ownerId: string,
) {
  const response = await shopifyAdmin<UpdateVariantMetafieldsMutation>(
    MutationUpdateVariantMetafields,
    {
      metafields: metafields.map((metafield) => ({
        namespace: metafield.namespace,
        key: metafield.key,
        ownerId,
        type: metafield.type,
        value: metafield.value,
      })),
    },
  );

  if (response.error) {
    console.log('ERROR', response.error);
    return null;
  }

  if (!response.data) {
    console.log('NO DATA', response);
    return null;
  }

  return response;
}

async function processProduct(product: Product) {
  console.log('Processing product', product.id);
  // get metafield value
  const productMetafield = product.productMetafield;
  const productMetafieldValue = productMetafield?.value
    ? productMetafield.value
    : null;
  console.log('Product metafield value', productMetafieldValue);
  // use the value to create a new metafield

  const productMetafields: Metafield[] = [];
  if (productMetafieldValue) {
    productMetafields.push({
      metafieldType: 'PRODUCT',
      namespace: CONFIG.product.new.namespace,
      key: CONFIG.product.new.key,
      type: CONFIG.product.new.type,
      value: productMetafieldValue,
    });
  }

  const processingResponse = {
    product: false,
    variants: false,
  };

  if (productMetafields.length > 0) {
    // set new product metafield:
    console.log('SETTING PRODUCT METAFIELDS', productMetafields.length);
    const productResponse = await updateProductMetafields(
      productMetafields,
      product.id,
    );

    logMetafieldUpdateData(productResponse);

    if (productResponse.data.metafieldsSet.metafields.length) {
      processingResponse.product = true;
      // write to file
      await appendCsvFile(
        productsFilename,
        productResponse.data.metafieldsSet.metafields.map((metafield) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          metafield: metafield.key,
          value: metafield.value,
        })),
      );
    }
  }

  const variants = product.variants.edges;
  const processedVariants = variants.map(async (variant) => {
    const variantMetafield = variant.node.variantMetafield;
    const variantMetafieldValue = variantMetafield?.value
      ? variantMetafield.value
      : null;
    console.log('Variant metafield value', variantMetafieldValue);
    const variantMetafields: Metafield[] = [];
    if (variantMetafieldValue) {
      variantMetafields.push({
        metafieldType: 'VARIANT',
        namespace: CONFIG.variant.new.namespace,
        key: CONFIG.variant.new.key,
        type: CONFIG.variant.new.type,
        value: variantMetafieldValue,
      });
    }
    // set new variant metafields
    if (variantMetafields.length > 0) {
      console.log('SETTING VARIANT METAFIELDS', variantMetafields.length);
      const variantResponse = await updateVariantMetafields(
        variantMetafields,
        variant.node.id,
      );

      logMetafieldUpdateData(variantResponse);

      if (variantResponse.data.metafieldsSet.metafields.length) {
        processingResponse.variants = true;
        // write to file
        await appendCsvFile(
          variantsFilename,
          variantResponse.data.metafieldsSet.metafields.map((metafield) => ({
            id: variant.node.id,
            sku: variant.node.sku,
            title: variant.node.title,
            metafield: metafield.key,
            value: metafield.value,
          })),
        );
      }
    }
    return processingResponse;
  });

  await Promise.all(processedVariants);

  return processingResponse;
}

async function getAllProducts() {
  let count = 0;
  async function getProducts(cursor?: string) {
    console.log('cursor', cursor);
    const response = await shopifyAdmin<ProductsWithMetafieldsQuery>(
      GetProductsWithMetafields,
      {
        first: 10,
        after: cursor,
        productMetafieldNamespace: CONFIG.product.old.namespace,
        productMetafieldKey: CONFIG.product.old.key,
        variantMetafieldNamespace: CONFIG.variant.old.namespace,
        variantMetafieldKey: CONFIG.variant.old.key,
      },
    );

    if (response.error) {
      console.log('ERROR', response.error);
      return null;
    }

    if (!response.data.products) {
      console.log('Products not found');
      return null;
    }

    const { edges, pageInfo } = response.data.products;

    const { hasNextPage, endCursor } = pageInfo;

    const processing = edges.map(async (edge) => {
      // process products
      const response = await processProduct(edge.node);
      return response;
    });

    const processed = await Promise.all(processing);
    count += processed.length;

    if (hasNextPage) {
      console.log('Total processed', count, 'products');
      console.log('Fetching more products...');
      await getProducts(endCursor);
    } else {
      console.log('Done processing', count, 'products');
    }
  }

  await getProducts();
}

async function getProduct(id: string) {
  console.log('Getting product', {
    id,
    productMetafieldNamespace: CONFIG.product.old.namespace,
    productMetafieldKey: CONFIG.product.old.key,
    variantMetafieldNamespace: CONFIG.variant.old.namespace,
    variantMetafieldKey: CONFIG.variant.old.key,
  });
  const response = await shopifyAdmin<ProductWithMetafieldsQuery>(
    GetProductWithMetafields,
    {
      id,
      productMetafieldNamespace: CONFIG.product.old.namespace,
      productMetafieldKey: CONFIG.product.old.key,
      variantMetafieldNamespace: CONFIG.variant.old.namespace,
      variantMetafieldKey: CONFIG.variant.old.key,
    },
  );

  if (response.error) {
    console.log('ERROR', response.error);
    return null;
  }

  if (!response.data.product) {
    console.log('Products not found');
    return null;
  }

  const { product } = response.data;

  console.log('Product', JSON.stringify(product, null, 2));

  if (product) {
    await processProduct(product);
  }
}

async function main() {
  try {
    // verify config
    console.log('Let us verify the config');
    const { isValid, errors } = verifyConfig();
    if (!isValid) {
      console.log('Config is not valid');
      errors.forEach((error) => {
        console.log(error);
      });
      return;
    }

    console.log("Config is valid, let's proceed");

    // generate file name
    const date = new Date();
    const dateString = date.toISOString().split('T')[0];
    productsFilename += `${CONFIG.product.new.namespace}_${CONFIG.product.new.key}--${dateString}`;
    variantsFilename += `${CONFIG.variant.new.namespace}_${CONFIG.variant.new.key}--${dateString}`;

    // create files
    console.log('Creating files');
    await createCsvFile(productsFilename, [
      'id',
      'title',
      'handle',
      'metafield',
      'value',
    ]);
    await createCsvFile(variantsFilename, [
      'id',
      'sku',
      'title',
      'metafield',
      'value',
    ]);

    // run one product
    await getProduct('gid://shopify/Product/14653504291183');

    // run all products
    // await getAllProducts();
  } catch (err: any) {
    console.log('ERROR', err);
  }
}

main();
