import type {
  ProductsQuery,
  ProductQuery,
  UpdateProductMetafieldsMutation,
  UpdateVariantMetafieldsMutation,
} from './lib/types/admin.generated';
import { shopifyAdmin, writeToFile, verifyConfig } from './lib/utils';
import {
  getProducts as GetProducts,
  getProduct as GetProduct,
} from './lib/admin/handlers/queries';
import {
  updateVariantMetafields as MutationUpdateVariantMetafields,
  updateProductMetafields as MutationUpdateProductMetafields,
} from './lib/admin/handlers/mutations';

type Products = ProductsQuery['products']['edges'];
type Product = Products[0]['node'];
type Variant = Product['variants']['edges'][0]['node'];
type MetafieldType = 'PRODUCT' | 'VARIANT';
type Metafield = {
  metafieldType: MetafieldType;
  namespace: string;
  key: string;
  type: string;
  value: string;
};

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

function getProductMetafieldValues(
  baseName: string,
  range: number,
  product: Product,
) {
  const values: string[] = [];
  for (let i = 1; i <= range; i++) {
    const key = `${baseName}${i}`;
    const metafield = product[key];
    if (metafield) {
      values.push(metafield.value);
    }
  }
  return values;
}

function getVariantMetafieldValues(
  baseName: string,
  range: number,
  variant: Variant,
) {
  const values: string[] = [];
  for (let i = 1; i <= range; i++) {
    const key = `${baseName}${i}`;
    const metafield = variant[key];
    if (metafield) {
      values.push(metafield.value);
    }
  }
  return values;
}

async function processProduct(product: Product) {
  // check if product metafield: defaultLifestyleImage1 - 8 exists
  const productDefaultLifestyleImages = getProductMetafieldValues(
    'defaultLifestyleImage',
    8,
    product,
  );

  const processingResponse = {
    product: false,
    variants: false,
  };

  if (productDefaultLifestyleImages.length > 0) {
    console.log(
      'PRODUCT DEFAULT LIFESTYLE IMAGES',
      productDefaultLifestyleImages.length,
    );
    // set new product metafield:
    const productMetafields: Metafield[] = [
      {
        metafieldType: 'PRODUCT',
        namespace: 'suavecito',
        key: 'lifestyle_images',
        type: 'list.file_reference',
        value: JSON.stringify(productDefaultLifestyleImages),
      },
    ];
    console.log('SETTING PRODUCT METAFIELDS', productMetafields.length);
    const productResponse = await updateProductMetafields(
      productMetafields,
      product.id,
    );
    console.log('UPDATED PRODUCT', JSON.stringify(productResponse, null, 2));
    if (productResponse.data.metafieldsSet.metafields.length) {
      processingResponse.product = true;
    }
  }

  // check if variant metafield: variantImage1 - 8 exists for each variant
  const variants = product.variants.edges;
  const processedVariants = variants.map(async (variant) => {
    const variantImages = getVariantMetafieldValues(
      'variantImage',
      8,
      variant.node,
    );
    const variantLifestyleImages = getVariantMetafieldValues(
      'variantLifestyleImage',
      4,
      variant.node,
    );
    const variantMetafields: Metafield[] = [];
    if (variantImages.length > 0) {
      console.log('VARIANT IMAGES', variantImages.length);
      variantMetafields.push({
        metafieldType: 'VARIANT',
        namespace: 'suavecito',
        key: 'images',
        type: 'list.file_reference',
        value: JSON.stringify(variantImages),
      });
    }
    if (variantLifestyleImages.length > 0) {
      console.log('VARIANT LIFESTYLE IMAGES', variantLifestyleImages.length);
      variantMetafields.push({
        metafieldType: 'VARIANT',
        namespace: 'suavecito',
        key: 'lifestyle_images',
        type: 'list.file_reference',
        value: JSON.stringify(variantLifestyleImages),
      });
    }
    // set new variant metafields
    if (variantMetafields.length > 0) {
      console.log('SETTING VARIANT METAFIELDS', variantMetafields.length);
      const variantResponse = await updateVariantMetafields(
        variantMetafields,
        variant.node.id,
      );
      console.log('UPDATED VARIANT', JSON.stringify(variantResponse, null, 2));
      if (variantResponse.data.metafieldsSet.metafields.length) {
        processingResponse.variants = true;
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
    const response = await shopifyAdmin<ProductsQuery>(GetProducts, {
      first: 10,
      after: cursor,
    });

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
    // console.log('Processed', processed.length, 'products');
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
  const response = await shopifyAdmin<ProductQuery>(GetProduct, {
    id,
  });

  if (response.error) {
    console.log('ERROR', response.error);
    return null;
  }

  if (!response.data.product) {
    console.log('Products not found');
    return null;
  }

  const { product } = response.data;

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

    // run one product
    // await getProduct('gid://shopify/Product/8876066898241');

    // run all products
    await getAllProducts();
  } catch (err: any) {
    console.log('ERROR', err);
  }
}

main();
