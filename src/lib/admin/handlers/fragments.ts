export const FragmentProductMetafields = `#graphql
  fragment ProductMetafieldFragment on Product {
    defaultLifestyleImage1: metafield(
      namespace: "debut"
      key: "default_lifestyle_image_1"
    ) {
      value
    }
    defaultLifestyleImage2: metafield(
      namespace: "debut"
      key: "default_lifestyle_image_2"
    ) {
      value
    }
    defaultLifestyleImage3: metafield(
      namespace: "debut"
      key: "default_lifestyle_image_3"
    ) {
      value
    }
    defaultLifestyleImage4: metafield(
      namespace: "debut"
      key: "default_lifestyle_image_4"
    ) {
      value
    }
    defaultLifestyleImage5: metafield(
      namespace: "debut"
      key: "default_lifestyle_image_5"
    ) {
      value
    }
    defaultLifestyleImage6: metafield(
      namespace: "debut"
      key: "default_lifestyle_image_6"
    ) {
      value
    }
    defaultLifestyleImage7: metafield(
      namespace: "debut"
      key: "default_lifestyle_image_7"
    ) {
      value
    }
    defaultLifestyleImage8: metafield(
      namespace: "debut"
      key: "default_lifestyle_image_8"
    ) {
      value
    }
  }
`;

export const FragmentProductVariantMetafields = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    variantImage1: metafield(namespace: "debut", key: "variant_image_1") {
      value
    }
    variantImage2: metafield(namespace: "debut", key: "variant_image_2") {
      value
    }
    variantImage3: metafield(namespace: "debut", key: "variant_image_3") {
      value
    }
    variantImage4: metafield(namespace: "debut", key: "variant_image_4") {
      value
    }
    variantImage5: metafield(namespace: "debut", key: "variant_image_5") {
      value
    }
    variantImage6: metafield(namespace: "debut", key: "variant_image_6") {
      value
    }
    variantImage7: metafield(namespace: "debut", key: "variant_image_7") {
      value
    }
    variantImage8: metafield(namespace: "debut", key: "variant_image_8") {
      value
    }
    variantLifestyleImage1: metafield(namespace: "debut", key: "variant_lifestyle_image_1") {
      value
    }
    variantLifestyleImage2: metafield(namespace: "debut", key: "variant_lifestyle_image_2") {
      value
    }
    variantLifestyleImage3: metafield(namespace: "debut", key: "variant_lifestyle_image_3") {
      value
    }
    variantLifestyleImage4: metafield(namespace: "debut", key: "variant_lifestyle_image_4") {
      value
    }
  }
`;
