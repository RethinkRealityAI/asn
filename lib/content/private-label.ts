/**
 * Private Label / contract manufacturing content for All Naturals Cosmetics
 * Inc. (ANCI). Copy supplied by the client; product examples and the inquiry
 * form fields mirror the legacy Services page.
 */

export const PRIVATE_LABEL = {
  eyebrow: "Private label",
  title: "Your brand, our plant.",
  lede:
    "Founded in 2002, All Naturals Cosmetics Inc. (ANCI) is a privately-owned Canadian contract manufacturer specializing in high-quality natural and organic personal care products.",
  intro: [
    "Guided by a commitment to nature-inspired innovation, we formulate and manufacture products using premium natural and organic ingredients that meet the evolving needs of today's consumers.",
    "ANCI offers comprehensive end-to-end manufacturing solutions, supporting clients from product concept and formulation through production, packaging, warehousing, and distribution. Our manufacturing capabilities include cleansers, shampoos, conditioners, creams, lotions, oils, serums, and gels, with packaging options ranging from jars and bottles to gallon containers, pails, and drums.",
    "We proudly serve businesses of all sizes — from emerging entrepreneurs requiring low minimum order quantities to established brands seeking scalable manufacturing solutions. Our personalized, hands-on approach ensures every client receives the attention, flexibility, and technical expertise needed to bring their products to market successfully.",
  ],
} as const;

export interface ProductCategory {
  name: string;
  products: string[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    name: "Face care",
    products: [
      "Foaming face wash",
      "Gel face cleansers",
      "Eye serums",
      "Face mist",
      "Skin-firming face cream",
    ],
  },
  {
    name: "Body care",
    products: [
      "Body washes & cleansers",
      "Hand wash",
      "Body lotion & creams",
      "Body butters",
      "Tattoo lotions",
    ],
  },
  {
    name: "Hair care",
    products: [
      "Shampoos & conditioners",
      "Hair oils",
      "Hair gels",
      "Styling products",
      "Hair sprays",
    ],
  },
];

export const CAPABILITIES = [
  {
    title: "Formulating",
    detail:
      "ANCI has set itself apart by formulating products that exceed our clients' high expectations. We're an expert in new product development, with a proven track record of creating top-selling, innovative, healthier and on-trend formulations — going the extra mile to provide as many natural formulas as possible.",
  },
  {
    title: "Quality assurance",
    detail:
      "Quality is at the core of everything we do. Our experienced team consistently meets client specifications while adhering to stringent quality-control standards at every stage — from laboratory development through manufacturing, packaging, warehousing and shipping.",
  },
  {
    title: "Regulatory compliance",
    detail:
      "As a personal-care manufacturer we comply with Health Canada regulations and operate under Good Manufacturing Practices (GMP). Our strict quality-control procedures give you the quality assurance you need, from development through packaging.",
  },
  {
    title: "Customer service",
    detail:
      "Exceptional service sets us apart. We know our clients' success is our success, so we pride ourselves on being responsive, reliable and committed to long-term partnerships — whether you're building a baby-care collection or an adult personal-care line.",
  },
];

/** Fields for the private-label inquiry form (mailto-based, like /contact). */
export interface InquiryField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  placeholder?: string;
  help?: string;
}

export const INQUIRY_FIELDS: InquiryField[] = [
  { name: "business", label: "Business name", type: "text", required: true, placeholder: "Your company" },
  { name: "country", label: "Country", type: "text", required: true, placeholder: "Canada" },
  { name: "email", label: "Email address", type: "email", required: true, placeholder: "you@company.com" },
  { name: "phone", label: "Phone & best time to call", type: "text", required: true, placeholder: "705-000-0000 · weekday mornings" },
  { name: "products", label: "Products of private-label interest", type: "textarea", required: true, placeholder: "e.g. body butter, foaming face wash, hair oil…" },
  { name: "quantities", label: "Quantity of each", type: "textarea", required: true, placeholder: "e.g. 500 units body butter, 1,000 units hair oil…", help: "Minimum order quantities start low — tell us what you need." },
];

export const PRIVATE_LABEL_EMAIL = "privatelabel@allnaturalscosmetics.ca";

export const PRIVATE_LABEL_CLOSING =
  "Whether you're developing a baby-care collection or an adult personal-care line, ANCI has the expertise, capacity and dedication to help transform your vision into reality. We thank you and look forward to serious inquiries only.";
