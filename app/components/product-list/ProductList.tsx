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

function toSelectionMap(selectedOptionsArr) {
  var map = {};
  (selectedOptionsArr ?? []).forEach((opt) => {
    map[opt.name] = opt.value;
  });
  return map;
}

function variantMatchesSelection(variant, selection) {
  var vMap = toSelectionMap(variant.selectedOptions);

  // selection can be partial: only compare keys that exist in selection
  for (var key in selection) {
    if (!selection[key]) continue;
    if (vMap[key] !== selection[key]) return false;
  }
  return true;
}

function resolveVariant(variants, selection) {
  // Prefer an available variant that matches
  var match = variants.find(
    (v) => v.availableForSale && variantMatchesSelection(v, selection),
  );
  if (match) return match;

  // Fall back: any matching variant (even unavailable)
  return variants.find((v) => variantMatchesSelection(v, selection)) ?? null;
}

function isOptionValueEnabled(variants, selection, optionName, value) {
  // test if there exists an available variant that matches current selection
  // plus this proposed option=value
  var nextSelection = { ...selection, [optionName]: value };

  return variants.some(
    (v) => v.availableForSale && variantMatchesSelection(v, nextSelection),
  );
}


const QuickViewModal = ({ product, onClose }) => {
  var closeBtnRef = useRef(null);
  var modalRef = useRef(null);

  var [isLoading, setIsLoading] = useState(true);
  var [details, setDetails] = useState(null);
  var [error, setError] = useState(null);

  var [selectedOptions, setSelectedOptions] = useState({});

  var options = details?.options ?? [];
  var variants = details?.variants?.nodes ?? [];

  // focus moves into modal on open
  useEffect(() => {
    if (modalRef.current) modalRef.current.focus();
    else if (closeBtnRef.current) closeBtnRef.current.focus();
  }, []);

  // lock background scroll while open
  useEffect(() => {
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
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

        var res = await fetch(
          `/api/product?handle=${encodeURIComponent(product.handle)}`
        );
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

  // initialize selection after details load
  useEffect(() => {
    if (!details) return;

    var firstAvailable =
      (details.variants?.nodes ?? []).find((v) => v.availableForSale) ??
      (details.variants?.nodes ?? [])[0];

    if (!firstAvailable) return;

    setSelectedOptions(toSelectionMap(firstAvailable.selectedOptions));
  }, [details]);

  var resolvedVariant = useMemo(() => {
    if (!variants.length) return null;
    return resolveVariant(variants, selectedOptions);
  }, [variants, selectedOptions]);

  var img =
    resolvedVariant?.image ??
    details?.featuredImage ??
    product?.featuredImage;

  var money =
    resolvedVariant?.price ??
    null; // keep it simple; price comes from variant

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick View: ${product.title}`}
      onClick={onClose}
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

          {/* Right: details (skeleton / error / options) */}
          <div className="text-sm">
            {isLoading ? (
              <SkeletonDetails />
            ) : error ? (
              <div>
                <div className="font-medium">Couldn’t load product details.</div>
                <div className="opacity-70 mt-1">{error}</div>
              </div>
            ) : (
              <>
                {/* Options */}
                {options.map((opt) => (
                  <div key={opt.name} className="mt-4 first:mt-0">
                    <div className="opacity-70">{opt.name}</div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        var isSelected = selectedOptions?.[opt.name] === val;
                        var isEnabled = isOptionValueEnabled(
                          variants,
                          selectedOptions,
                          opt.name,
                          val
                        );

                        return (
                          <button
                            key={val}
                            type="button"
                            disabled={!isEnabled}
                            onClick={() => {
                              if (!isEnabled) return;
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [opt.name]: val,
                              }));
                            }}
                            className={[
                              "px-3 py-2 rounded-full border text-sm transition",
                              isSelected
                                ? "border-black dark:border-white"
                                : "border-black/10 dark:border-white/10",
                              isEnabled
                                ? "hover:bg-black/5 dark:hover:bg-white/10"
                                : "opacity-40 cursor-not-allowed",
                            ].join(" ")}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Description */}
                {details?.description ? (
                  <>
                    <div className="opacity-70 mt-6">Description</div>
                    <p className="mt-1 leading-6">{details.description}</p>
                  </>
                ) : null}
              </>
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
