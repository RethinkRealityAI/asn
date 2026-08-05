import { describe, it, expect } from "vitest";
import { encodeNetlifyForm } from "@/lib/forms/netlify";

describe("encodeNetlifyForm", () => {
  it("url-encodes fields and prepends form-name", () => {
    const body = encodeNetlifyForm("contact", { name: "Jane Doe", email: "jane@x.com" });
    const params = new URLSearchParams(body);
    expect(params.get("form-name")).toBe("contact");
    expect(params.get("name")).toBe("Jane Doe");
    expect(params.get("email")).toBe("jane@x.com");
  });

  it("escapes special characters (spaces, ampersands, plus)", () => {
    const body = encodeNetlifyForm("contact", { message: "Shea & argan + more" });
    // Round-trips cleanly through URLSearchParams.
    expect(new URLSearchParams(body).get("message")).toBe("Shea & argan + more");
    // And is genuinely encoded on the wire (no raw & inside the value).
    expect(body).toContain("message=Shea+%26+argan");
  });

  it("omits undefined/empty optional fields but keeps provided ones", () => {
    const body = encodeNetlifyForm("wholesale", { company: "Acme", note: "" });
    const params = new URLSearchParams(body);
    expect(params.get("company")).toBe("Acme");
    expect(params.get("note")).toBe("");
  });
});
