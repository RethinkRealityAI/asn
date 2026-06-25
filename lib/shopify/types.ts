export type Money = { amount: number; currencyCode: "CAD" };
export type ProductImage = { url: string; altText: string; width?: number; height?: number };
export type Variant = {
  id: string; title: string; sku: string | null;
  price: Money; compareAtPrice: Money | null;
  available: boolean; selectedOptions: { name: string; value: string }[];
};
export type Product = {
  handle: string; title: string; descriptionHtml: string;
  vendor: string; productType: string; tags: string[];
  options: { name: string; values: string[] }[];
  variants: Variant[]; images: ProductImage[];
  priceRange: { min: Money; max: Money };
};
export type Collection = { handle: string; title: string; productHandles: string[] };
export type CartLine = { variantId: string; quantity: number };
export type Cart = { id: string; lines: (CartLine & { product: Product; variant: Variant })[]; subtotal: Money };
