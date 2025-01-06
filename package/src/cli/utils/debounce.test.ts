import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("executes just once", () => {
    const cb = vi.fn();
    const debounced = debounce(cb, 1000);
    for (let i = 0; i < 10; i++) {
      debounced();
    }
    vi.runAllTimers();
    expect(cb).toHaveBeenCalledOnce();
  });
});
