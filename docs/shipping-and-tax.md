# Shipping & tax — live configuration and open merchant actions

Source of truth for what the storefront is allowed to claim about shipping and
tax. If you change a rate in Shopify, change it here and in the copy the tests
guard (`test/shipping.test.ts`).

Store: `shea-allnaturals.myshopify.com` · currency **CAD** · prices are
**tax-exclusive** (`taxesIncluded: false`).

---

## The $75 free-shipping promo is retired (2026-08-14)

The "free Canada-wide shipping over $75" offer has ended. It was removed in two
places, and both must stay removed:

1. **Shopify** — the conditional free rate on the Domestic *Standard* rate was
   deleted, along with the equivalent "free over $100 CAD" condition on the US
   *Standard International* rate.
2. **Site copy** — promo bar, PDP trust badge, PDP shipping panel, cart drawer,
   cart page (threshold + nudge), policies page, and the policy text in
   `docs/shopify-policies.md`.

`test/shipping.test.ts` sweeps `app/`, `components/` and `lib/` and fails if any
free-shipping-over-a-threshold copy reappears.

> **Gotcha for whoever edits rates next:** in this API version a conditional
> rate is exposed as a *synthetic* method definition sharing the base rate's ID
> (`…/DeliveryMethodDefinition/123?source=RateRangeCondition&source_id=456`).
> Passing that synthetic ID to `methodDefinitionsToDelete` deletes the **entire
> base rate and all its weight tiers**, not just the condition. Both the
> Domestic *Standard* rate and the three US *Standard International* tiers had
> to be recreated after removing the promos. Re-read the profile and verify
> every tier survived after any delete.

---

## Live rates (verified 2026-08-14)

**Domestic — Canada** — Canada Post **carrier-calculated (live rates)**, with
Regular Parcel, Expedited Parcel, Xpresspost and Priority all active. The old
flat $12 Standard / $20 Express rates were **removed** — leaving them alongside
live rates would have let every shopper pick the $12 option and undercut the
real cost. Because rates are live, **there is no fixed domestic price the site
may quote**; `test/shipping.test.ts` fails if any copy tries.

| Method | Rate | Weight band |
|---|---|---|
| Canada Post (4 services) | live | up to 30 kg (Canada Post's limit) |
| Freight (over 30 kg) | $140.00 CAD | 30.0001 – 500 kg |

**Local pickup** — free, configured on the Barrie location. Fridays at
220 Bayview Dr. Unit #18; 24-hour ready time; call ahead.

**US cross-border**
| Method | Rate | Weight band |
|---|---|---|
| Standard International | $7.90 | 0 – 0.5 kg |
| Standard International | $19.90 | 0.5001 – 1.5 kg |
| Standard International | $29.90 | 1.5001 – 30 kg |
| Express International | $34.90 | 0 – 1.5 kg |
| Freight (over 30 kg) | $199.00 CAD | 30.0001 – 500 kg |

**International** — Canada Post carrier-calculated (live rates), select
countries.

The two **Freight (over 30 kg)** rates exist so heavy wholesale orders can
always complete checkout — previously anything above 30 kg (e.g. two 50 lb
pails = 45.4 kg) returned no rate at all and dead-ended the shopper. **The $140
and $199 prices are estimates and should be confirmed against a real freight
quote.**

---

## Variant weights are now populated

Every one of the **208 variants** now carries a real shipping weight
(previously all were 0 kg). This matters because the US tiers and the Canada
Post carrier quotes are weight-driven — at 0 kg a 22.68 kg (50 lb) pail was
quoting the 0–0.5 kg band of **$7.90** to the US, and Canada Post could not
return a correct domestic/international rate at all.

Weights come from `Variant Grams` in
`data/source/all_naturals_shopify_products.csv` and now survive the whole
pipeline:

`source CSV → lib/shopify/mock/seed.ts (weightGrams) → catalog.json →
scripts/shopify-csv.ts (Variant Grams / Variant Weight Unit) → Shopify import`

The live Storefront adapter also reads `weight`/`weightUnit` and normalises to
grams (`lib/shopify/storefront/adapter.ts`). `test/weights.test.ts` guards every
link in that chain.

Representative weights: retail jars 23 g – 1 kg · 5 lb 2 268 g ·
8.8 lb / Gallon 3 992 g · 25 lb 11 340 g · 50 lb 22 680 g · 28 kg 27 941 g.

---

## Open merchant actions (no Admin API — must be done in the Shopify admin)

These three cannot be set through the API; the connector has no mutation for
shop tax settings or checkout form fields.

### 1. Require BOTH phone and email on every order
**Settings → Checkout → Customer contact method**

- Set **Customer contact method** to **Email** (this makes email mandatory).
- Set **Shipping address phone number** to **Required**.

Together these make email *and* phone mandatory for every order. Leaving contact
method on "Phone number or email" lets a shopper check out with only one of
them. (The only programmatic alternative is a checkout UI extension with a
required `phone-field`, which needs a custom app — the settings toggle is the
right fix and works on the current plan.)

### 2. Charge tax on shipping
**Settings → Taxes and duties → Canada → Charge tax on shipping rates** → ON

Currently `taxShipping: false`, which is **wrong for Canada** — GST/HST applies
to the delivery charge when the goods themselves are taxable, so the store is
under-collecting on every shipped order.

### 3. Confirm the Canada tax registration
**Settings → Taxes and duties → Canada → Collect sales tax**

Confirm the GST/HST number is entered and the regions are set, so Shopify
applies 13% HST in Ontario, 5% GST in Alberta, 5% GST + 7% PST in BC, and so on.
All 208 variants are already flagged `taxable: true`, and prices are
tax-exclusive, so the only remaining variable is the registration itself.

---

## Known gaps not yet addressed

- **The two freight prices ($140 domestic / $199 US) are estimates.** Confirm
  them against a real freight quote and update both Shopify and this file.
- **Live rates depend on the Canada Post connection.** If Shopify can't reach
  Canada Post at checkout, domestic shoppers under 30 kg see no rate, because
  the flat fallback was deliberately removed. If that turns out to be flaky in
  practice, add a flat backstop priced *above* typical live rates so it only
  wins when nothing else is returned.
- **Express International only covers 0–1.5 kg**, so heavier US orders see
  Standard only. Intentional or not, it's worth a decision.
- **US cross-border rates are still fixed weight bands**, not live Canada Post
  rates like Canada and International. Worth aligning at some point.
