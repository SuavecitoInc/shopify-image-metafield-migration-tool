const mutation = `#graphql
  mutation UpdateProductMetafields($metafields: [MetafieldsSetInput!]!,) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
        createdAt
        updatedAt
        owner {
          __typename
          ... on Product {
            id
            title
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                }
              }
            }
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
