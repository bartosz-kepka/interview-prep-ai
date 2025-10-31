import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/LoginForm";
import "@testing-library/jest-dom";

// Mock the loginSchema for simplicity in tests, focusing on component behavior
vi.mock("@/lib/auth/validation", () => ({
  loginSchema: {
    safeParse: (data: any) => {
      if (!data.email || !data.email.includes("@")) {
        return {
          success: false,
          error: {
            errors: [{ path: ["email"], message: "Invalid email" }],
          },
        };
      }
      if (!data.password || data.password.length < 6) {
        return {
          success: false,
          error: {
            errors: [{ path: ["password"], message: "Password too short" }],
          },
        };
      }
      return { success: true, data };
    },
  },
}));

describe("LoginForm", () => {
  const user = userEvent.setup();

  // Mock window.location.href
  const { location } = window;
  beforeEach(() => {
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: "" };

    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    window.location = location;
    vi.restoreAllMocks();
  });

  it("should render email, password inputs and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("should show client-side validation errors for invalid email", async () => {
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Invalid email")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should show client-side validation errors for short password", async () => {
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "123");
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Password too short")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should submit the form and redirect to "/" on successful login', async () => {
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
    });

    await waitFor(() => {
      expect(window.location.href).toBe("/");
    });
  });

  it("should redirect to the provided redirect URL on successful login", async () => {
    // Set search params for the test
    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost/login?redirect=/dashboard",
        search: "?redirect=/dashboard",
      },
      writable: true,
    });

    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });

  it("should display a general API error message on failure", async () => {
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Internal Server Error" }),
    });

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Internal Server Error")).toBeInTheDocument();
  });

  it("should display field-specific errors from the API", async () => {
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      json: () =>
        Promise.resolve({
          fields: { email: "This email is already taken" },
        }),
    });

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("This email is already taken")).toBeInTheDocument();
  });

  it("should redirect to /check-email when API returns EMAIL_NOT_CONFIRMED code", async () => {
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ code: "EMAIL_NOT_CONFIRMED" }),
    });

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/check-email");
    });
  });

  it("should display a network error message if fetch fails", async () => {
    (global.fetch as vi.Mock).mockRejectedValue(new TypeError("Failed to fetch"));

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Network error. Please check your connection and try again.")).toBeInTheDocument();
  });

  it('should disable form elements and show "Logging in..." during submission', async () => {
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    (global.fetch as vi.Mock).mockReturnValue(fetchPromise);

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /logging in.../i })).toBeDisabled();
    });
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();

    // Resolve the fetch and check if the form is enabled again
    resolveFetch!({ ok: true, json: () => Promise.resolve({}) });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).toBeEnabled();
    });
  });
});
