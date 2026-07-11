import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement scrollIntoView - ChatPanel calls it to auto-scroll.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
