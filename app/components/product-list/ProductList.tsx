"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";

function formatMoney(money) {
  if (!money) return "";
  return `$${Number(money.amount).toFixed(2)} ${money.currencyCode}`;
}

export const ProductList = ({ products }) => {
  var [activeId, setActiveId] = useState(null);

  var activeProduct = useMemo(() => {
    return products.find((p) => p.id === activeId) ?? null;
  }, [activeId, products]);

  var closeModal = () => setActiveId(null);

  // close on esc tab
  useEffect(() => {
    if (!activeProduct) return;

    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    var onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => 
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
  }, [activeProduct]);

  return (
    <>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              onQuickView={() => setActiveId(product.id)}
            />
          </li>
        ))}
      </ul>

      {activeProduct ? (
        <QuickViewModal product={activeProduct} onClose={closeModal} />
      ) : null}
    </>
  );
};

const QuickViewModal = ({ product, onClose }) => {
  var img = product?.featuredImage;
  var money = product?.priceRange?.minVariantPrice;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quick View"
      onClick={onClose} // backdrop click closes
    >
      <div className="absolute inset-0 bg-black/60" />

      <div
        className="relative z-10 w-full max-w-xl rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 p-5"
        onClick={(e) => e.stopPropagation()} // prevent backdrop close when clicking modal
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{product.title}</h3>
            <div className="mt-1 text-sm opacity-80">{formatMoney(money)}</div>
          </div>

          <button
            type="button"
            className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {img?.url ? (
          <img
            src={img.url}
            alt={img.altText ?? product.title}
            className="mt-4 w-full h-64 object-cover rounded-xl"
            loading="lazy"
          />
        ) : (
          <div className="mt-4 w-full h-64 rounded-xl bg-black/5 dark:bg-white/10" />
        )}

        <div className="mt-4 text-sm opacity-70">
          Handle:{" "}
          <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">
            {product.handle}
          </code>
        </div>
      </div>
    </div>
  );
};
