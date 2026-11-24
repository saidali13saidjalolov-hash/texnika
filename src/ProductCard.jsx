import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';

/**
 * Ntexnik — Maishiy texnika internet-do'koni
 * Komponent: ProductCard.jsx
 * Vazifasi: Katalog, aksiyalar, sevimlilar va qidiruv natijalari uchun
 * interaktiv, animatsiyali mahsulot kartochkasi (Grid va List rejimlarini qo'llab-quvvatlaydi).
 */

const FALLBACK_APPLIANCE_IMAGE =
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80';

const CATEGORY_FALLBACKS = {
  refrigerators:
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=80',
  washing:
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80',
  tv:
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80',
  climate:
    'https://images.unsplash.com/photo-1614631446501-abcf76949eca?auto=format&fit=crop&w=900&q=80',
  kitchen:
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
  vacuum:
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80',
};

const INSTALLMENT_PLANS = [
  { months: 6, label: '6 oy', markup: 0.06 },
  { months: 12, label: '12 oy', markup: 0.14 },
  { months: 24, label: '24 oy', markup: 0.28 },
];

const ENERGY_CLASS_STYLES = {
  'A+++': { bg: '#059669', text: '#ffffff', label: 'A+++ Eko' },
  'A++': { bg: '#10b981', text: '#ffffff', label: 'A++' },
  'A+': { bg: '#34d399', text: '#064e3b', label: 'A+' },
  A: { bg: '#fbbf24', text: '#78350f', label: 'A' },
  B: { bg: '#f97316', text: '#ffffff', label: 'B' },
};

/* ==========================================================================
   IKONKALAR TO'PLAMI (Inline Crisp Vector Icons)
   ========================================================================== */

const HeartIcon = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ScaleIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 3h5v5" />
    <path d="M8 3H3v5" />
    <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
    <path d="m15 9 6-6" />
  </svg>
);

const CartIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const StarIcon = ({ filled = true }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={filled ? '#f59e0b' : 'none'}
    stroke="#f59e0b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const BoltIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const TruckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const WifiIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckBadgeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ==========================================================================
   YORDAMCHI FUNKSIYALAR (Formatlash va Hisob-kitoblar)
   ========================================================================== */

export const formatUZSPrice = (value) => {
  const numeric = Number(value) || 0;
  return `${Math.round(numeric)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;
};

const computeDiscountPercentage = (price, oldPrice) => {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const computeMonthlyPayment = (price, months = 12) => {
  const plan =
    INSTALLMENT_PLANS.find((item) => item.months === months) ||
    INSTALLMENT_PLANS[1];
  const totalWithMarkup = price * (1 + plan.markup);
  return Math.ceil(totalWithMarkup / plan.months / 1000) * 1000;
};

const resolveStockInfo = (stock) => {
  if (typeof stock !== 'number') {
    return { status: 'in-stock', label: 'Omborda mavjud', dotColor: '#10b981' };
  }
  if (stock <= 0) {
    return { status: 'out-of-stock', label: 'Sotuvda tugagan', dotColor: '#ef4444' };
  }
  if (stock <= 4) {
    return {
      status: 'low-stock',
      label: `Faqat ${stock} dona qoldi`,
      dotColor: '#f59e0b',
    };
  }
  return {
    status: 'in-stock',
    label: `Omborda mavjud (${stock} dona)`,
    dotColor: '#10b981',
  };
};

/* ==========================================================================
   ICHKI YORDAMCHI KOMPONENTLAR
   ========================================================================== */

const CardTopBadges = ({
  discountPercent,
  isNew,
  isBestseller,
  isInverter,
  energyClass,
}) => {
  const energyMeta = energyClass ? ENERGY_CLASS_STYLES[energyClass] : null;

  return (
    <div className="ntx-card__badges" aria-label="Mahsulot belgilari">
      {discountPercent > 0 && (
        <span className="ntx-badge ntx-badge--discount">
          -{discountPercent}%
        </span>
      )}
      {isBestseller && (
        <span className="ntx-badge ntx-badge--hit">Xit savdo</span>
      )}
      {isNew && <span className="ntx-badge ntx-badge--new">Yangi model</span>}
      {isInverter && (
        <span className="ntx-badge ntx-badge--inverter">
          <BoltIcon /> Inverter
        </span>
      )}
      {energyMeta && (
        <span
          className="ntx-badge ntx-badge--energy"
          style={{
            backgroundColor: energyMeta.bg,
            color: energyMeta.text,
          }}
          title={`Energiya samaradorligi sinfi: ${energyClass}`}
        >
          {energyMeta.label}
        </span>
      )}
    </div>
  );
};

const CardActionRail = ({
  isFavorite,
  isCompared,
  heartBurst,
  onToggleFavorite,
  onToggleCompare,
  onQuickView,
}) => {
  return (
    <div className="ntx-card__actions-rail">
      <button
        type="button"
        className={`ntx-icon-btn ntx-icon-btn--fav ${
          isFavorite ? 'is-active' : ''
        } ${heartBurst ? 'is-bursting' : ''}`}
        onClick={onToggleFavorite}
        aria-label={
          isFavorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"
        }
        title={isFavorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
      >
        <HeartIcon filled={isFavorite} />
        {heartBurst && (
          <span className="ntx-heart-particles" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        )}
      </button>

      <button
        type="button"
        className={`ntx-icon-btn ${isCompared ? 'is-active' : ''}`}
        onClick={onToggleCompare}
        aria-label="Taqqoslashga qo'shish"
        title={
          isCompared ? "Taqqoslashdan olib tashlash" : "Taqqoslashga qo'shish"
        }
      >
        <ScaleIcon />
      </button>

      <button
        type="button"
        className="ntx-icon-btn"
        onClick={onQuickView}
        aria-label="Tezkor ko'rish"
        title="Tezkor ko'rish"
      >
        <EyeIcon />
      </button>
    </div>
  );
};

/* ==========================================================================
   ASOSIY KOMPONENT: ProductCard
   ========================================================================== */

const ProductCard = ({
  product,
  onAddToCart,
  onUpdateQuantity,
  onToggleFavorite,
  onToggleCompare,
  onQuickView,
  isFavorite = false,
  isCompared = false,
  cartQuantity = 0,
  viewMode = 'grid',
  animationDelay = 0,
}) => {
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedMonths, setSelectedMonths] = useState(12);
  const [isInstallmentOpen, setIsInstallmentOpen] = useState(false);
  const [showSpecsDrawer, setShowSpecsDrawer] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(false);
  const [tiltTransform, setTiltTransform] = useState('');
  const [glarePosition, setGlarePosition] = useState({
    x: 50,
    y: 50,
    opacity: 0,
  });

  // Mahsulot ma'lumotlarini xavfsiz normalizatsiya qilish
  const normalizedProduct = useMemo(() => {
    const safeItem = product || {};
    const variants = Array.isArray(safeItem.variants) ? safeItem.variants : [];
    const activeVariant = variants[selectedVariantIdx] || null;

    const baseImages =
      Array.isArray(safeItem.images) && safeItem.images.length > 0
        ? safeItem.images
        : safeItem.image
        ? [safeItem.image]
        : [
            CATEGORY_FALLBACKS[safeItem.category] || FALLBACK_APPLIANCE_IMAGE,
          ];

    const resolvedImages =
      activeVariant && activeVariant.image
        ? [activeVariant.image, ...baseImages.filter((u) => u !== activeVariant.image)]
        : baseImages;

    const currentPrice =
      activeVariant && typeof activeVariant.price === 'number'
        ? activeVariant.price
        : Number(safeItem.price) || 0;

    const currentOldPrice =
      activeVariant && typeof activeVariant.oldPrice === 'number'
        ? activeVariant.oldPrice
        : Number(safeItem.oldPrice) || 0;

    const currentSku =
      (activeVariant && activeVariant.sku) ||
      safeItem.sku ||
      `NTX-${safeItem.id || '100'}`;

    return {
      id: safeItem.id,
      title: safeItem.title || 'Maishiy texnika',
      brand: safeItem.brand || 'Ntexnik Select',
      category: safeItem.category || 'kitchen',
      categoryLabel: safeItem.categoryLabel || 'Maishiy texnika',
      price: currentPrice,
      oldPrice: currentOldPrice,
      rating: typeof safeItem.rating === 'number' ? safeItem.rating : 4.8,
      reviewsCount:
        typeof safeItem.reviewsCount === 'number' ? safeItem.reviewsCount : 24,
      stock: typeof safeItem.stock === 'number' ? safeItem.stock : 12,
      warranty: safeItem.warranty || '3 yil rasmiy kafolat',
      deliveryText: safeItem.deliveryText || 'Toshkent bo‘ylab bepul yetkazish',
      energyClass: safeItem.energyClass || 'A++',
      isInverter: Boolean(safeItem.isInverter),
      isSmartWifi: Boolean(safeItem.isSmartWifi),
      isNew: Boolean(safeItem.isNew),
      isBestseller: Boolean(safeItem.isBestseller),
      sku: currentSku,
      images: resolvedImages,
      variants,
      activeVariant,
      specs: Array.isArray(safeItem.specs) ? safeItem.specs : [],
      shortDescription:
        safeItem.shortDescription ||
        "Yuqori energiya tejamkorligi va zamonaviy texnologiyalarga ega ishonchli maishiy texnika.",
    };
  }, [product, selectedVariantIdx]);

  // Variant o'zgarganda rasm indeksini 0 ga qaytarish
  useEffect(() => {
    setActiveImageIdx(0);
  }, [selectedVariantIdx, product?.id]);

  // RAF tozalash
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const discountPercent = useMemo(
    () =>
      computeDiscountPercentage(
        normalizedProduct.price,
        normalizedProduct.oldPrice
      ),
    [normalizedProduct.price, normalizedProduct.oldPrice]
  );

  const monthlyInstallment = useMemo(
    () => computeMonthlyPayment(normalizedProduct.price, selectedMonths),
    [normalizedProduct.price, selectedMonths]
  );

  const stockMeta = useMemo(
    () => resolveStockInfo(normalizedProduct.stock),
    [normalizedProduct.stock]
  );

  const isOutOfStock = stockMeta.status === 'out-of-stock';

  // Joriy ko'rsatilayotgan rasm URL (fallback himoyasi bilan)
  const currentImageUrl = useMemo(() => {
    const rawUrl = normalizedProduct.images[activeImageIdx];
    if (!rawUrl || failedImages[rawUrl]) {
      return (
        CATEGORY_FALLBACKS[normalizedProduct.category] ||
        FALLBACK_APPLIANCE_IMAGE
      );
    }
    return rawUrl;
  }, [
    normalizedProduct.images,
    normalizedProduct.category,
    activeImageIdx,
    failedImages,
  ]);

  const handleImageError = useCallback((failedUrl) => {
    if (!failedUrl) return;
    setFailedImages((prev) => ({ ...prev, [failedUrl]: true }));
  }, []);

  // 3D Tilt & Yorug'lik jilosi (Glare) harakati
  const handleMouseMove = useCallback(
    (e) => {
      if (viewMode === 'list' || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const relX = (clientX - rect.left) / rect.width;
        const relY = (clientY - rect.top) / rect.height;
        const rotateY = (relX - 0.5) * 7; // max +-3.5deg
        const rotateX = (0.5 - relY) * 7;

        setTiltTransform(
          `perspective(1100px) rotateX(${rotateX.toFixed(
            2
          )}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`
        );
        setGlarePosition({
          x: Math.round(relX * 100),
          y: Math.round(relY * 100),
          opacity: 0.24,
        });
      });
    },
    [viewMode]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setTiltTransform('');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    setIsInstallmentOpen(false);
  }, []);

  // Sevimlilarga qo'shish (animatsiyali)
  const handleFavoriteClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isFavorite) {
        setHeartBurst(true);
        setTimeout(() => setHeartBurst(false), 650);
      }
      if (typeof onToggleFavorite === 'function') {
        onToggleFavorite(normalizedProduct.id);
      }
    },
    [isFavorite, normalizedProduct.id, onToggleFavorite]
  );

  const handleCompareClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (typeof onToggleCompare === 'function') {
        onToggleCompare(normalizedProduct.id);
      }
    },
    [normalizedProduct.id, onToggleCompare]
  );

  const handleQuickViewClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (typeof onQuickView === 'function') {
        onQuickView({
          ...product,
          selectedVariant: normalizedProduct.activeVariant,
          resolvedPrice: normalizedProduct.price,
        });
      }
    },
    [product, normalizedProduct, onQuickView]
  );

  const handleAddToCartClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (isOutOfStock) return;

      setCartFeedback(true);
      setTimeout(() => setCartFeedback(false), 520);

      if (typeof onAddToCart === 'function') {
        onAddToCart({
          ...product,
          id: normalizedProduct.id,
          sku: normalizedProduct.sku,
          price: normalizedProduct.price,
          oldPrice: normalizedProduct.oldPrice,
          image: currentImageUrl,
          selectedVariant: normalizedProduct.activeVariant,
        });
      }
    },
    [
      isOutOfStock,
      onAddToCart,
      product,
      normalizedProduct,
      currentImageUrl,
    ]
  );

  const handleStepQuantity = useCallback(
    (e, delta) => {
      e.stopPropagation();
      const nextQty = cartQuantity + delta;
      if (typeof onUpdateQuantity === 'function') {
        onUpdateQuantity(
          normalizedProduct.id,
          nextQty,
          normalizedProduct.sku
        );
      }
    },
    [cartQuantity, onUpdateQuantity, normalizedProduct.id, normalizedProduct.sku]
  );

  const handlePrevImage = useCallback(
    (e) => {
      e.stopPropagation();
      setActiveImageIdx((prev) =>
        prev === 0 ? normalizedProduct.images.length - 1 : prev - 1
      );
    },
    [normalizedProduct.images.length]
  );

  const handleNextImage = useCallback(
    (e) => {
      e.stopPropagation();
      setActiveImageIdx((prev) =>
        prev === normalizedProduct.images.length - 1 ? 0 : prev + 1
      );
    },
    [normalizedProduct.images.length]
  );

  const hasMultipleImages = normalizedProduct.images.length > 1;

  return (
    <article
      ref={cardRef}
      className={`ntx-card ntx-card--${viewMode} ${
        isOutOfStock ? 'ntx-card--soldout' : ''
      } ${cartQuantity > 0 ? 'ntx-card--in-cart' : ''}`}
      style={{
        transform: tiltTransform || undefined,
        animationDelay: `${Math.min(animationDelay, 480)}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleQuickViewClick}
      aria-label={normalizedProduct.title}
    >
      {/* 3D Yorug'lik jilosi qatlami */}
      <div
        className="ntx-card__glare"
        aria-hidden="true"
        style={{
          opacity: glarePosition.opacity,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.75), transparent 62%)`,
        }}
      />

      {/* YUQORI / CHAP MEDIA QISMI */}
      <div className="ntx-card__media">
        <CardTopBadges
          discountPercent={discountPercent}
          isNew={normalizedProduct.isNew}
          isBestseller={normalizedProduct.isBestseller}
          isInverter={normalizedProduct.isInverter}
          energyClass={normalizedProduct.energyClass}
        />

        <CardActionRail
          isFavorite={isFavorite}
          isCompared={isCompared}
          heartBurst={heartBurst}
          onToggleFavorite={handleFavoriteClick}
          onToggleCompare={handleCompareClick}
          onQuickView={handleQuickViewClick}
        />

        <div className="ntx-card__image-stage">
          <img
            src={currentImageUrl}
            alt={normalizedProduct.title}
            className="ntx-card__img"
            loading="lazy"
            onError={() =>
              handleImageError(normalizedProduct.images[activeImageIdx])
            }
          />

          {hasMultipleImages && (
            <>
              <button
                type="button"
                className="ntx-card__gallery-nav ntx-card__gallery-nav--prev"
                onClick={handlePrevImage}
                aria-label="Oldingi rasm"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                className="ntx-card__gallery-nav ntx-card__gallery-nav--next"
                onClick={handleNextImage}
                aria-label="Keyingi rasm"
              >
                <ChevronRightIcon />
              </button>

              <div
                className="ntx-card__gallery-dots"
                onClick={(e) => e.stopPropagation()}
              >
                {normalizedProduct.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`ntx-card__dot ${
                      idx === activeImageIdx ? 'is-active' : ''
                    }`}
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`${idx + 1}-rasmni ko'rish`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Smart Wi-Fi / Kafolat pastki tasmasi */}
        <div className="ntx-card__media-footer">
          <span className="ntx-card__warranty-pill">
            <ShieldCheckIcon /> {normalizedProduct.warranty}
          </span>
          {normalizedProduct.isSmartWifi && (
            <span className="ntx-card__wifi-pill" title="Smart Wi-Fi boshqaruvi">
              <WifiIcon /> Wi-Fi
            </span>
          )}
        </div>
      </div>

      {/* ASOSIY MA'LUMOTLAR TANASI */}
      <div className="ntx-card__body">
        {/* Brend, Artikul va Reyting */}
        <div className="ntx-card__meta-top">
          <div className="ntx-card__brand-wrap">
            <span className="ntx-card__brand">{normalizedProduct.brand}</span>
            <span className="ntx-card__sku">Kod: {normalizedProduct.sku}</span>
          </div>

          <div
            className="ntx-card__rating"
            title={`Reyting: ${normalizedProduct.rating} / 5 (${normalizedProduct.reviewsCount} ta sharh)`}
          >
            <StarIcon filled />
            <span className="ntx-card__rating-val">
              {normalizedProduct.rating.toFixed(1)}
            </span>
            <span className="ntx-card__reviews">
              ({normalizedProduct.reviewsCount})
            </span>
          </div>
        </div>

        {/* Mahsulot nomi */}
        <h3 className="ntx-card__title">
          <button
            type="button"
            className="ntx-card__title-btn"
            onClick={handleQuickViewClick}
          >
            {normalizedProduct.title}
          </button>
        </h3>

        {/* List rejimida qisqa tavsif */}
        {viewMode === 'list' && (
          <p className="ntx-card__excerpt">
            {normalizedProduct.shortDescription}
          </p>
        )}

        {/* Variantlar (Rang / Sig'im / Model modifikatsiyasi) */}
        {normalizedProduct.variants.length > 0 && (
          <div
            className="ntx-card__variants"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="ntx-card__variants-label">
              Variant:{' '}
              <strong>
                {normalizedProduct.activeVariant?.name || 'Standart'}
              </strong>
            </span>
            <div className="ntx-card__variant-list">
              {normalizedProduct.variants.map((variant, idx) => {
                const isSelected = idx === selectedVariantIdx;
                return (
                  <button
                    key={variant.sku || variant.name || idx}
                    type="button"
                    className={`ntx-variant-chip ${
                      isSelected ? 'is-selected' : ''
                    }`}
                    onClick={() => setSelectedVariantIdx(idx)}
                    title={variant.name}
                  >
                    {variant.colorHex && (
                      <span
                        className="ntx-variant-chip__swatch"
                        style={{ backgroundColor: variant.colorHex }}
                      />
                    )}
                    <span>{variant.shortLabel || variant.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Asosiy texnik xususiyatlar (Compact Specs) */}
        {normalizedProduct.specs.length > 0 && (
          <div className="ntx-card__specs-box">
            <ul className="ntx-card__specs-list">
              {normalizedProduct.specs
                .slice(0, showSpecsDrawer || viewMode === 'list' ? 5 : 3)
                .map((spec, i) => (
                  <li key={i} className="ntx-card__spec-item">
                    <span className="ntx-card__spec-key">{spec.label}:</span>
                    <span className="ntx-card__spec-val">{spec.value}</span>
                  </li>
                ))}
            </ul>

            {viewMode === 'grid' && normalizedProduct.specs.length > 3 && (
              <button
                type="button"
                className="ntx-card__specs-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpecsDrawer((prev) => !prev);
                }}
              >
                {showSpecsDrawer
                  ? 'Qisqartirish'
                  : `Yana ${normalizedProduct.specs.length - 3} ta xususiyat`}
              </button>
            )}
          </div>
        )}

        {/* Ombor holati va Yetkazib berish */}
        <div className="ntx-card__logistics">
          <span className="ntx-card__stock">
            <i
              className="ntx-card__stock-dot"
              style={{ backgroundColor: stockMeta.dotColor }}
            />
            {stockMeta.label}
          </span>
          <span className="ntx-card__delivery">
            <TruckIcon /> {normalizedProduct.deliveryText}
          </span>
        </div>

        {/* NARX, MUDDATLI TO'LOV VA SAVATGA QO'SHISH BLOKI */}
        <div
          className="ntx-card__footer"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Interaktiv muddatli to'lov (bo'lib to'lash) */}
          <div className="ntx-installment">
            <button
              type="button"
              className="ntx-installment__trigger"
              onClick={() => setIsInstallmentOpen((prev) => !prev)}
              aria-expanded={isInstallmentOpen}
            >
              <span className="ntx-installment__badge">
                {formatUZSPrice(monthlyInstallment)} / oyiga
              </span>
              <span className="ntx-installment__term">
                {selectedMonths} oy <ChevronDownIcon />
              </span>
            </button>

            {isInstallmentOpen && (
              <div className="ntx-installment__popover">
                <div className="ntx-installment__popover-head">
                  Muddatli to'lov rejasini tanlang:
                </div>
                <div className="ntx-installment__plans">
                  {INSTALLMENT_PLANS.map((plan) => {
                    const monthly = computeMonthlyPayment(
                      normalizedProduct.price,
                      plan.months
                    );
                    const active = plan.months === selectedMonths;
                    return (
                      <button
                        key={plan.months}
                        type="button"
                        className={`ntx-installment__plan-btn ${
                          active ? 'is-active' : ''
                        }`}
                        onClick={() => {
                          setSelectedMonths(plan.months);
                          setIsInstallmentOpen(false);
                        }}
                      >
                        <strong>{plan.label}</strong>
                        <span>{formatUZSPrice(monthly)}/oy</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Narx va Savat tugmasi qatori */}
          <div className="ntx-card__purchase-row">
            <div className="ntx-card__price-col">
              {normalizedProduct.oldPrice > normalizedProduct.price && (
                <span className="ntx-card__old-price">
                  {formatUZSPrice(normalizedProduct.oldPrice)}
                </span>
              )}
              <span className="ntx-card__current-price">
                {formatUZSPrice(normalizedProduct.price)}
              </span>
            </div>

            {cartQuantity > 0 ? (
              <div
                className="ntx-stepper"
                role="group"
                aria-label="Savatdagi miqdorni o'zgartirish"
              >
                <button
                  type="button"
                  className="ntx-stepper__btn"
                  onClick={(e) => handleStepQuantity(e, -1)}
                  aria-label="Kamaytirish"
                >
                  <MinusIcon />
                </button>
                <span className="ntx-stepper__count">{cartQuantity}</span>
                <button
                  type="button"
                  className="ntx-stepper__btn"
                  onClick={(e) => handleStepQuantity(e, 1)}
                  disabled={cartQuantity >= normalizedProduct.stock}
                  aria-label="Ko'paytirish"
                >
                  <PlusIcon />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`ntx-add-btn ${
                  cartFeedback ? 'is-added-anim' : ''
                }`}
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
              >
                {cartFeedback ? (
                  <>
                    <CheckBadgeIcon />
                    <span>Qo'shildi</span>
                  </>
                ) : (
                  <>
                    <CartIcon />
                    <span>{isOutOfStock ? 'Tugagan' : 'Savatga'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default React.memo(ProductCard);