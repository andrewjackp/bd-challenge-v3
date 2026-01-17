type ProductCardProps = {
  product: {
    id: string;
    title: string;
    featuredImage?: {
      url: string;
      altText?: string | null;
    };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
  };
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const price = Number(product.priceRange.minVariantPrice.amount).toFixed(2);

  return (
    <article className="product-card">
      {product.featuredImage && (
        <img
          src={product.featuredImage.url}
          alt={product.featuredImage.altText ?? product.title}
        />
      )}

      <h3>{product.title}</h3>
      <p>
        ${price} {product.priceRange.minVariantPrice.currencyCode}
      </p>

      <button type="button">Quick View</button>
    </article>
  );
};
