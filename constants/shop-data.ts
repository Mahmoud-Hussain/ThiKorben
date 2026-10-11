export type ProductCategory = 'plumbing' | 'electrical' | 'tools' | 'cleaning';

export type ProductIconName =
  | 'water-outline'
  | 'construct-outline'
  | 'remove-outline'
  | 'options-outline'
  | 'flash-outline'
  | 'toggle-outline'
  | 'hammer-outline'
  | 'cube-outline';

export type ShopProduct = {
  id: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  categoryLabel: string;
  icon: ProductIconName;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  warrantyMonths: number | null;
  description: string;
  features: string[];
  recommended?: boolean;
  aiKeywords: string[];
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'pvc-connector-half',
    name: 'PVC Connector 1/2 Inch',
    shortName: 'PVC Connector',
    category: 'plumbing',
    categoryLabel: 'Plumbing',
    icon: 'water-outline',
    price: 120,
    oldPrice: 140,
    rating: 4.8,
    reviews: 86,
    stock: 32,
    warrantyMonths: null,
    description:
      'Durable 1/2 inch PVC connector suitable for household water-line repair and sink plumbing connections.',
    features: [
      '1/2 inch standard size',
      'Leak-resistant fitting',
      'Suitable for household plumbing',
      'Lightweight PVC construction',
    ],
    recommended: true,
    aiKeywords: [
      'connector',
      'pvc connector',
      '1/2 inch connector',
      'half inch connector',
    ],
  },

  {
    id: 'teflon-tape',
    name: 'Professional Teflon Tape',
    shortName: 'Teflon Tape',
    category: 'plumbing',
    categoryLabel: 'Plumbing',
    icon: 'construct-outline',
    price: 45,
    rating: 4.7,
    reviews: 143,
    stock: 67,
    warrantyMonths: null,
    description:
      'Thread sealing Teflon tape designed to reduce water leakage around threaded pipe and plumbing connections.',
    features: [
      'Strong thread sealing',
      'Water resistant',
      'Easy application',
      'Suitable for taps and pipe joints',
    ],
    recommended: true,
    aiKeywords: ['teflon', 'teflon tape', 'thread tape', 'tape'],
  },

  {
    id: 'rubber-washer-set',
    name: 'Rubber Washer Repair Set',
    shortName: 'Rubber Washer',
    category: 'plumbing',
    categoryLabel: 'Plumbing',
    icon: 'options-outline',
    price: 80,
    oldPrice: 100,
    rating: 4.6,
    reviews: 72,
    stock: 41,
    warrantyMonths: null,
    description:
      'Multi-size rubber washer set for common household taps, faucets and plumbing repair jobs.',
    features: [
      'Multiple washer sizes',
      'Flexible rubber construction',
      'Helps prevent dripping',
      'Useful for emergency repairs',
    ],
    aiKeywords: ['washer', 'rubber washer', 'tap washer'],
  },

  {
    id: 'pvc-pipe-half',
    name: 'PVC Water Pipe 1/2 Inch - 3ft',
    shortName: 'PVC Pipe',
    category: 'plumbing',
    categoryLabel: 'Plumbing',
    icon: 'remove-outline',
    price: 180,
    rating: 4.7,
    reviews: 59,
    stock: 20,
    warrantyMonths: null,
    description:
      'Three-foot household PVC water pipe with standard 1/2 inch diameter for repair and replacement work.',
    features: [
      '3 feet length',
      '1/2 inch diameter',
      'Water resistant',
      'Suitable for indoor plumbing',
    ],
    aiKeywords: ['pipe', 'pvc pipe', 'water pipe'],
  },

  {
    id: 'brass-angle-valve',
    name: 'Premium Brass Angle Valve',
    shortName: 'Water Valve',
    category: 'plumbing',
    categoryLabel: 'Plumbing',
    icon: 'water-outline',
    price: 650,
    oldPrice: 720,
    rating: 4.9,
    reviews: 118,
    stock: 18,
    warrantyMonths: 12,
    description:
      'Heavy-duty brass water control valve for sinks, basins and household plumbing systems.',
    features: [
      'Solid brass body',
      'Smooth water control',
      'Corrosion resistant',
      '12-month ThiKorben warranty',
    ],
    recommended: true,
    aiKeywords: ['valve', 'water valve', 'angle valve'],
  },

  {
    id: 'basin-faucet',
    name: 'Stainless Steel Basin Faucet',
    shortName: 'Basin Faucet',
    category: 'plumbing',
    categoryLabel: 'Plumbing',
    icon: 'water-outline',
    price: 1450,
    oldPrice: 1650,
    rating: 4.8,
    reviews: 96,
    stock: 14,
    warrantyMonths: 24,
    description:
      'Modern stainless-steel basin faucet with smooth water flow and corrosion-resistant finish.',
    features: [
      'Stainless steel body',
      'Modern polished finish',
      'Easy installation',
      '24-month ThiKorben warranty',
    ],
    aiKeywords: ['faucet', 'tap', 'basin faucet', 'water tap'],
  },

  {
    id: 'electrical-wire',
    name: 'Copper Electrical Wire 2.5mm',
    shortName: 'Electrical Wire',
    category: 'electrical',
    categoryLabel: 'Electrical',
    icon: 'flash-outline',
    price: 950,
    oldPrice: 1020,
    rating: 4.9,
    reviews: 166,
    stock: 25,
    warrantyMonths: 12,
    description:
      'High-quality insulated copper electrical wire for residential electrical repair and installation.',
    features: [
      '2.5mm copper conductor',
      'Heat-resistant insulation',
      'Residential grade',
      '12-month product warranty',
    ],
    recommended: true,
    aiKeywords: ['wire', 'electrical wire', 'copper wire'],
  },

  {
    id: 'modular-switch',
    name: '16A Premium Modular Switch',
    shortName: 'Modular Switch',
    category: 'electrical',
    categoryLabel: 'Electrical',
    icon: 'toggle-outline',
    price: 220,
    rating: 4.6,
    reviews: 84,
    stock: 36,
    warrantyMonths: 12,
    description:
      '16A modular electrical switch designed for reliable everyday residential use.',
    features: [
      '16 amp rating',
      'Flame-resistant housing',
      'Smooth switching mechanism',
      '12-month warranty',
    ],
    aiKeywords: ['switch', 'electric switch', 'modular switch'],
  },

  {
    id: 'adjustable-wrench',
    name: 'Professional Adjustable Wrench',
    shortName: 'Adjustable Wrench',
    category: 'tools',
    categoryLabel: 'Tools',
    icon: 'hammer-outline',
    price: 780,
    oldPrice: 850,
    rating: 4.8,
    reviews: 91,
    stock: 16,
    warrantyMonths: 12,
    description:
      'Heavy-duty adjustable wrench for plumbing, maintenance and household repair work.',
    features: [
      'Hardened steel body',
      'Adjustable jaw',
      'Non-slip grip',
      '12-month warranty',
    ],
    aiKeywords: ['wrench', 'adjustable wrench', 'spanner'],
  },

  {
    id: 'cleaning-kit',
    name: 'Home Repair Cleaning Kit',
    shortName: 'Cleaning Kit',
    category: 'cleaning',
    categoryLabel: 'Cleaning',
    icon: 'cube-outline',
    price: 390,
    rating: 4.5,
    reviews: 52,
    stock: 28,
    warrantyMonths: null,
    description:
      'Compact cleaning supply kit useful after plumbing, electrical and maintenance work.',
    features: [
      'Multi-purpose cleaner',
      'Microfiber cloth',
      'Protective gloves',
      'Compact package',
    ],
    aiKeywords: ['cleaning', 'cleaning kit', 'cleaner'],
  },
];

let cartItems: CartItem[] = [];

export function getProductById(id?: string) {
  if (!id) {
    return undefined;
  }

  return SHOP_PRODUCTS.find(product => product.id === id);
}

export function formatShopMoney(value: number) {
  return `৳${value.toLocaleString()}`;
}

export function addToCart(productId: string, quantity = 1) {
  const product = getProductById(productId);

  if (!product || quantity <= 0) {
    return;
  }

  const existing = cartItems.find(item => item.productId === productId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    cartItems.push({
      productId,
      quantity: Math.min(quantity, product.stock),
    });
  }
}

export function updateCartQuantity(productId: string, quantity: number) {
  const product = getProductById(productId);

  if (!product) {
    return;
  }

  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  cartItems = cartItems.map(item =>
    item.productId === productId
      ? {
          ...item,
          quantity: Math.min(quantity, product.stock),
        }
      : item,
  );
}

export function removeFromCart(productId: string) {
  cartItems = cartItems.filter(item => item.productId !== productId);
}

export function clearCart() {
  cartItems = [];
}

export function getCartCount() {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

export function getDetailedCartItems() {
  return cartItems
    .map(item => {
      const product = getProductById(item.productId);

      if (!product) {
        return null;
      }

      return {
        ...item,
        product,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter(
      (
        item,
      ): item is {
        productId: string;
        quantity: number;
        product: ShopProduct;
        lineTotal: number;
      } => item !== null,
    );
}

export function getCartSubtotal() {
  return getDetailedCartItems().reduce(
    (total, item) => total + item.lineTotal,
    0,
  );
}
