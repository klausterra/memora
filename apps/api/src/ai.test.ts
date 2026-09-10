import { describe, expect, it } from "vitest";
import { isAdminEmail, pickIcebreaker } from "@memora/shared";
import { summarizeSession } from "./ai.js";

describe("shared admin", () => {
  it("marks configured emails as admin", () => {
    expect(isAdminEmail("klausqterra@gmail.com")).toBe(true);
    expect(isAdminEmail("wanieleterra@gmail.com")).toBe(true);
    expect(isAdminEmail("other@example.com")).toBe(false);
  });
});

describe("icebreaker", () => {
  it("returns a non-empty prompt", () => {
    expect(pickIcebreaker().length).toBeGreaterThan(5);
  });
});

describe("summarizeSession", () => {
  it("extracts person and project memories", () => {
    const result = summarizeSession([
      {
        role: "user",
        content:
          "Hoje conversei com o João sobre o projeto Atlas e acho melhor simplificar.",
      },
    ]);
    expect(result.title.length).toBeGreaterThan(0);
    expect(result.memories.some((m) => m.type === "person")).toBe(true);
    expect(result.memories.some((m) => m.type === "project")).toBe(true);
  });
});
