export const getCollections = /* GraphQL */ `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        title
        handle
      }
    }
  }
`;
