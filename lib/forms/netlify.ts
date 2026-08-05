/**
 * lib/forms/netlify.ts
 *
 * Netlify Forms submission helpers. Netlify captures form POSTs at deploy time
 * by detecting a static HTML form (see public/__forms.html). Client components
 * submit by POSTing a url-encoded body (including `form-name`) to `/__forms.html`.
 * Submissions land in Netlify → Forms, with optional email notifications.
 */

/** Build the `application/x-www-form-urlencoded` body Netlify expects. */
export function encodeNetlifyForm(formName: string, fields: Record<string, string>): string {
  const params = new URLSearchParams();
  params.append("form-name", formName);
  for (const [key, value] of Object.entries(fields)) {
    params.append(key, value ?? "");
  }
  return params.toString();
}

/** POST a Netlify form. Resolves on 2xx, throws otherwise. Injectable fetch for tests. */
export async function submitNetlifyForm(
  formName: string,
  fields: Record<string, string>,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  const res = await fetchImpl("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeNetlifyForm(formName, fields),
  });
  if (!res.ok) {
    throw new Error(`Form submission failed (${res.status})`);
  }
}
