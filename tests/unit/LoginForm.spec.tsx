import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/LoginForm";
import * as Auth from "@/components/hooks/useAuth";
import "@testing-library/jest-dom";

const loginMock = vi.fn();
const useAuthSpy = vi.spyOn(Auth, "useAuth");

describe("LoginForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.resetAllMocks();
    const { location } = window;
    delete window.location;
    window.location = { ...location, href: "", search: "" };
    useAuthSpy.mockReturnValue({
      login: loginMock,
      isSubmitting: false,
      signup: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
    });
  });

  it("should render email, password inputs and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("should show client-side validation errors for invalid data", async () => {
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should submit the form and call the login function", async () => {
    loginMock.mockResolvedValue({ data: {}, error: null });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("should display a general API error message on failure", async () => {
    loginMock.mockResolvedValue({
      data: null,
      error: { error: "Invalid credentials" },
    });

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should display field-specific errors from the API", async () => {
    loginMock.mockResolvedValue({
      data: null,
      error: {
        fields: { email: "This email is not registered" },
      },
    });

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("This email is not registered")).toBeInTheDocument();
  });

  it("should redirect to /check-email when API returns EMAIL_NOT_CONFIRMED code", async () => {
    loginMock.mockResolvedValue({
      data: null,
      error: { code: "EMAIL_NOT_CONFIRMED" },
    });

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/check-email");
    });
  });

  it('should disable form elements and show "Logging in..." during submission', async () => {
    useAuthSpy.mockReturnValue({
      login: loginMock,
      isSubmitting: true,
      signup: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
    });

    render(<LoginForm />);

    expect(screen.getByRole("button", { name: /logging in.../i })).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
  });
});
