"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";

function formatMoney(money) {
  if (!money) return "";
  return `$${Number(money.amount).toFixed(2)} ${money.currencyCode}`;
}

export const ProductList = ({ products }) => {
  var [activeId, setActiveId] = useState(null);
  var lastTriggerRef = useRef(null);

  var activeProduct = useMemo(() => {
    return products.find((p) => p.id === activeId) ?? null;
  }, [activeId, products]);

var closeModal = () => {
  setActiveId(null);

  requestAnimationFrame(() => {
    if (lastTriggerRef.current) lastTriggerRef.current.focus();
  });
};

  return (
    <>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              onQuickView={(triggerEl) => {
                lastTriggerRef.current = triggerEl;
                setActiveId(product.id);
              }}
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
  var closeBtnRef = useRef(null);

  var [isLoading, setIsLoading] = useState(true);
  var [details, setDetails] = useState(null);
  var [error, setError] = useState(null);

  // focus moves into modal on open
  useEffect(() => {
    if (closeBtnRef.current) closeBtnRef.current.focus();
  }, []);

  // lock background scroll while open
  useEffect(() => {
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  var modalRef = useRef(null);

  useEffect(() => {
    // focus moves into modal on open
    if (modalRef.current) modalRef.current.focus();
    else if (closeBtnRef.current) closeBtnRef.current.focus();
  }, []);


  // close on esc
  useEffect(() => {
    var onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // fetch details for skeleton state
  useEffect(() => {
    var isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        // NOTE: implement /api/product?handle=... below
        var res = await fetch(`/api/product?handle=${encodeURIComponent(product.handle)}`);
        var json = await res.json();

        if (!res.ok) throw new Error(json?.error ?? "Failed to load product");

        if (isMounted) setDetails(json.product);
      } catch (err) {
        if (isMounted) setError(err.message ?? "Error loading product");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [product.handle]);

  var img = details?.featuredImage ?? product?.featuredImage;
  var money = details?.priceRange?.minVariantPrice ?? product?.priceRange?.minVariantPrice;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick View: ${product.title}`}
      onClick={onClose} // backdrop click closes
    >
      <div className="absolute inset-0 bg-black/60" />

      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-3xl rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 p-5 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{product.title}</h3>
            <div className="mt-1 text-sm opacity-80">{formatMoney(money)}</div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* body */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: image */}
          <div>
            {isLoading ? (
              <div className="animate-pulse w-full h-72 rounded-xl bg-black/10 dark:bg-white/10" />
            ) : img?.url ? (
              <img
                src={img.url}
                alt={img.altText ?? product.title}
                className="w-full h-72 object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-72 rounded-xl bg-black/5 dark:bg-white/10" />
            )}
          </div>

          {/* right: details */}
          <div>
            {isLoading ? (
              <SkeletonDetails />
            ) : error ? (
              <div className="text-sm">
                <div className="font-medium">Couldn’t load product details.</div>
                <div className="opacity-70 mt-1">{error}</div>
              </div>
            ) : (
              <div className="text-sm">
                <div className="opacity-70">Handle</div>
                <div className="mt-1 font-mono">{product.handle}</div>

                {details?.description ? (
                  <>
                    <div className="opacity-70 mt-4">Description</div>
                    <p className="mt-1 leading-6">{details.description}</p>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonDetails = () => {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-3/4 rounded bg-black/10 dark:bg-white/10" />
      <div className="mt-3 h-4 w-32 rounded bg-black/10 dark:bg-white/10" />

      <div className="mt-6 space-y-2">
        <div className="h-4 w-full rounded bg-black/10 dark:bg-white/10" />
        <div className="h-4 w-11/12 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-4 w-10/12 rounded bg-black/10 dark:bg-white/10" />
      </div>

      <div className="mt-6 h-9 w-28 rounded-lg bg-black/10 dark:bg-white/10" />
    </div>
  );
};
