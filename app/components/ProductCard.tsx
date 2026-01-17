"use client";

function formatMoney(money) {
  if (!money) return "";
  return `${money.amount} ${money.currencyCode}`;
}

export default function ProductCard({ product, onQuickView }) {
  var img = product?.featuredImage;
  var price = product?.priceRange?.minVariantPrice;

  return (
    <li className="rounded-xl border border-black/10 dark:border-white/10 p-4">
      {img?.url ? (
        <img
          src={img.url}
          alt={img.altText ?? product.title}
          className="w-full h-40 object-cover rounded-lg"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 rounded-lg bg-black/5 dark:bg-white/10" />
      )}

      <div className="mt-3 font-medium text-lg">{product.title}</div>

      <div className="mt-1 text-sm opacity-80">{formatMoney(price)}</div>

      <button
        type="button"
        className="mt-3 inline-flex items-center justify-center rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        onClick={() => onQuickView(product)}
      >
        Quick View
      </button>
    </li>
  );
}
