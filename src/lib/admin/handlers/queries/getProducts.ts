import {
  FragmentProductMetafields,
  FragmentProductVariantMetafields,
} from '../fragments';

const query = `#graphql
  ${FragmentProductMetafields}
  ${FragmentProductVariantMetafields}
  query Products($first: Int!, $after: String) {
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
          variants(first: 250) {
            edges {
              node {
                id
                title
                sku
                ...ProductVariantFragment
              }
            }
          }
        }
      }
    }
  }
`;

export default query;
