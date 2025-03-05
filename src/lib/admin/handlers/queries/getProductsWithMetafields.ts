import {
  FragmentProductMetafields,
  FragmentProductVariantMetafields,
} from '../fragments';

const query = `#graphql
  ${FragmentProductMetafields}
  ${FragmentProductVariantMetafields}
  query ProductsWithMetafields($first: Int!, $after: String, $productMetafieldNamespace: String!, $productMetafieldKey: String!, $variantMetafieldNamespace: String!, $variantMetafieldKey: String!) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      edges {
        node {
          id
          title
          handle
          ...ProductMetafieldFragment
          productMetafield: metafield(namespace: $productMetafieldNamespace, key: $productMetafieldKey) {
            value
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                sku
                ...ProductVariantFragment
                variantMetafield: metafield(namespace: $variantMetafieldNamespace, key: $variantMetafieldKey) {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default query;
