export const getProductByHandle = /* GraphQL */ `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description

      featuredImage {
        url
        altText
      }

      options {
        name
        values
      }

      variants(first: 100) {
        nodes {
          id
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
`;
