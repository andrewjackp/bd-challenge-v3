export const getShop = `#graphql
  query GetShop {
    shop {
      name
      description
    }
  }
` as const;
