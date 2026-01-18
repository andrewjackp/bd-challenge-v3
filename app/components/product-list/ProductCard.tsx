export const ProductCard = ({ product, onQuickView }) => {
  var img = product?.featuredImage;
  var money = product?.priceRange?.minVariantPrice;

  return (
    <article
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-4
        rounded-xl
        border
        border-black/10
        dark:border-white/10
        p-4
      "
    >
      {/* Image */}
      {img?.url ? (
        <img
          src={img.url}
          alt={img.altText ?? product.title}
          className="
            w-full
            h-48
            sm:h-full
            object-cover
            rounded-lg
          "
          loading="lazy"
        />
      ) : (
        <div
          className="
            w-full
            h-48
            sm:h-full
            rounded-lg
            bg-black/5
            dark:bg-white/10
          "
        />
      )}

      {/* Content */}
      <div className="flex flex-col justify-between">
        <div>
          <div className="font-medium text-lg">{product.title}</div>

          <div className="mt-1 text-sm opacity-80">
            ${Number(money?.amount ?? 0).toFixed(2)}{" "}
            {money?.currencyCode ?? ""}
          </div>
        </div>

        <button
          type="button"
          className="mt-4 
          inline-flex
          items-center
          justify-center
          self-start
          rounded-lg 
          border border-black/10 
          dark:border-white/10 
          px-3 
          py-2 text-sm 
          hover:bg-black/5 
          dark:hover:bg-white/10"
          onClick={(e) => onQuickView(e.currentTarget)}
        >
          Quick View
        </button>
      </div>
    </article>
  );
};
