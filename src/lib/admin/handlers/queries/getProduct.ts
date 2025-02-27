import {
  FragmentProductMetafields,
  FragmentProductVariantMetafields,
} from '../fragments';

const query = `#graphql
  ${FragmentProductMetafields}
  ${FragmentProductVariantMetafields}
  query Product($id: ID!) {
    product(id: $id) {
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
`;

export default query;
