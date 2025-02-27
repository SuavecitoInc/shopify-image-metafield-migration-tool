const mutation = `#graphql
  mutation UpdateVariantMetafields($metafields: [MetafieldsSetInput!]!,) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
        createdAt
        updatedAt
        owner {
          __typename
          ... on ProductVariant {
            id
            title
            sku
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }

  }
`;

export default mutation;
