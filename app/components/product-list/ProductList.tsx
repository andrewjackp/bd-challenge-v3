import { ProductCard } from "./ProductCard";

type ProductListProps = {
  products: any[];
};

export const ProductList = ({ products }: ProductListProps) => {
  return (
    <ul className="product-list">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
};
