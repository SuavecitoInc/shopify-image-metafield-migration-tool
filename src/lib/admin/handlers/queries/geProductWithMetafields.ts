import {
  FragmentProductMetafields,
  FragmentProductVariantMetafields,
} from '../fragments';

const query = `#graphql
  ${FragmentProductMetafields}
  ${FragmentProductVariantMetafields}
  query ProductWithMetafields($id: ID!, $productMetafieldNamespace: String!, $productMetafieldKey: String!, $variantMetafieldNamespace: String!, $variantMetafieldKey: String!) {
    product(id: $id) {
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
`;

export default query;
