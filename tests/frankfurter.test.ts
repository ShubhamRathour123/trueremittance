import assert from "node:assert/strict";
import test from "node:test";
import { fetchFrankfurterRate } from "../src/lib/fx/frankfurter";

test("validates and normalizes Frankfurter currency codes", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    assert.equal(
      input,
      "https://api.frankfurter.dev/v2/rate/AED/INR"
    );

    return new Response(
      JSON.stringify({
        base: "AED",
        quote: "INR",
        rate: 26.14,
        date: "2026-09-28"
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  };

  try {
    const result = await fetchFrankfurterRate("aed", "inr");

    assert.deepEqual(result, {
      base: "AED",
      quote: "INR",
      rate: 26.14,
      date: "2026-09-28"
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects invalid Frankfurter payloads", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        base: "AED",
        quote: "INR",
        rate: -1,
        date: "2026-09-28"
      }),
      { status: 200 }
    );

  try {
    await assert.rejects(
      () => fetchFrankfurterRate("AED", "INR"),
      /invalid positive rate/i
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects non-successful Frankfurter responses", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => new Response("not found", { status: 404 });

  try {
    await assert.rejects(
      () => fetchFrankfurterRate("AED", "INR"),
      /HTTP 404/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
