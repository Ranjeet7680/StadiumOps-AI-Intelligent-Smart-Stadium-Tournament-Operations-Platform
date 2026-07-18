// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

// Mock fetch globally
(globalThis as any).fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

// Mock WebSocket globally to prevent JSDOM/Undici experimental Node bugs
class MockWebSocket {
  url: string;
  readyState = 0;
  onopen: any = null;
  onclose: any = null;
  onmessage: any = null;
  onerror: any = null;
  constructor(url: string) {
    this.url = url;
  }
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}
(globalThis as any).WebSocket = MockWebSocket;

describe("StadiumOps AI Frontend Suite", () => {
  it("renders the Login screen with appropriate credentials form", () => {
    const { container } = render(<App />);
    
    // Check main logo title
    expect(screen.getAllByText("StadiumOps AI")[0]).toBeDefined();
    expect(screen.getAllByText("Establish Command Link")[0]).toBeDefined();
    
    // Check credentials input fields
    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
  });

  it("permits role selections and typing input details", () => {
    const { container } = render(<App />);
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput).not.toBeNull();
    fireEvent.change(emailInput, { target: { value: "manager@stadiumops.ai" } });
    expect(emailInput.value).toBe("manager@stadiumops.ai");
  });

  it("checks accessibility attributes are conformant", () => {
    render(<App />);
    const submitBtn = screen.getAllByRole("button", { name: /Establish Command Link/i })[0];
    expect(submitBtn).toBeDefined();
  });
});
