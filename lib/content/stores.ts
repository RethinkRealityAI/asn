/**
 * Retail stockists — where Shea Allnaturals is sold, with links to each
 * retailer's Canadian site. (We use refined typographic lockups rather than
 * the retailers' own logos — their brand colours are blue/red and would clash
 * with the warm palette, and trademark logos shouldn't be re-hosted.)
 */

export interface Store {
  name: string;
  href: string;
  /** short locale note */
  note?: string;
}

export const STORES: Store[] = [
  { name: "Walmart", href: "https://www.walmart.ca", note: "Nationwide" },
  { name: "Shoppers Drug Mart", href: "https://www.shoppersdrugmart.ca", note: "Nationwide" },
  { name: "Jean Coutu", href: "https://www.jeancoutu.com", note: "Quebec & Ontario" },
  { name: "Rexall", href: "https://www.rexall.ca", note: "Nationwide" },
];
