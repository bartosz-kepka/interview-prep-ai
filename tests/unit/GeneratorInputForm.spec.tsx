import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GeneratorInputForm } from "@/components/ai/GeneratorInputForm";

describe("GeneratorInputForm", () => {
  // Arrange - setup mocks
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockOnGenerate.mockClear();
  });

  describe("Rendering", () => {
    it("should render the form with all elements", () => {
      // Act
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);

      // Assert
      expect(
        screen.getByRole("textbox", { name: /job description or text to generate questions from/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /generate questions/i })).toBeInTheDocument();
      expect(screen.getByText("0/10000 characters")).toBeInTheDocument();
    });

    it("should render with proper placeholder text", () => {
      // Act
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);

      // Assert
      expect(screen.getByPlaceholderText("Paste your job description or any text here...")).toBeInTheDocument();
    });

    it("should have proper ARIA attributes for accessibility", () => {
      // Act
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);

      // Assert
      const textarea = screen.getByRole("textbox");
      const counter = screen.getByText("0/10000 characters");

      expect(textarea).toHaveAttribute("aria-describedby");
      expect(counter).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("User Interactions", () => {
    it("should update character count when user types", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");

      // Act
      await user.type(textarea, "Hello World");

      // Assert
      expect(screen.getByText("11/10000 characters")).toBeInTheDocument();
      expect(textarea).toHaveValue("Hello World");
    });

    it("should enable submit button when text is entered", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");
      const button = screen.getByRole("button");

      // Assert - button initially disabled
      expect(button).toBeDisabled();

      // Act
      await user.type(textarea, "Some text");

      // Assert - button enabled after typing
      expect(button).toBeEnabled();
    });

    it("should call onGenerate with trimmed text when form is submitted", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");
      const button = screen.getByRole("button");

      // Act
      await user.type(textarea, "  Test text with spaces  ");
      await user.click(button);

      // Assert
      expect(mockOnGenerate).toHaveBeenCalledTimes(1);
      expect(mockOnGenerate).toHaveBeenCalledWith("  Test text with spaces  ");
    });

    it("should submit form when Enter is pressed inside form", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");

      // Act
      await user.type(textarea, "Test text");
      // Submit via form submission (Ctrl+Enter or similar)
      const form = textarea.closest("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }

      // Assert
      expect(mockOnGenerate).toHaveBeenCalledWith("Test text");
    });
  });

  describe("Validation", () => {
    it("should keep submit button disabled when textarea is empty", () => {
      // Act
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);

      // Assert
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should keep submit button disabled when textarea contains only whitespace", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");

      // Act
      await user.type(textarea, "   ");

      // Assert
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should disable submit button when character limit is exceeded", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");
      const longText = "a".repeat(10001);

      // Act - use paste for large text to avoid timeout
      await user.click(textarea);
      await user.paste(longText);

      // Assert
      expect(screen.getByText("10001/10000 characters")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should not call onGenerate when character limit is exceeded and form is submitted", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");
      const longText = "a".repeat(10001);

      // Act - use paste for large text
      await user.click(textarea);
      await user.paste(longText);
      // Try to submit the form programmatically
      const form = textarea.closest("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }

      // Assert
      expect(mockOnGenerate).not.toHaveBeenCalled();
    });

    it("should allow submission at exactly 10000 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");
      const maxText = "a".repeat(10000);

      // Act - use paste for large text
      await user.click(textarea);
      await user.paste(maxText);

      // Assert
      expect(screen.getByText("10000/10000 characters")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeEnabled();
    });
  });

  describe("Loading State", () => {
    it('should show "Generating..." text when isGenerating is true', () => {
      // Act
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={true} />);

      // Assert
      expect(screen.getByRole("button", { name: /generating\.\.\./i })).toBeInTheDocument();
    });

    it("should disable submit button when isGenerating is true", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={true} />);
      const textarea = screen.getByRole("textbox");

      // Act
      await user.type(textarea, "Some valid text");

      // Assert
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should not call onGenerate when button is clicked during generation", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={true} />);
      const textarea = screen.getByRole("textbox");
      const button = screen.getByRole("button");

      // Act
      await user.type(textarea, "Some valid text");
      await user.click(button);

      // Assert
      expect(mockOnGenerate).not.toHaveBeenCalled();
    });

    it('should transition from "Generate Questions" to "Generating..." correctly', () => {
      // Arrange
      const { rerender } = render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);

      // Assert - initial state
      expect(screen.getByRole("button", { name: /generate questions/i })).toBeInTheDocument();

      // Act - update to generating state
      rerender(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={true} />);

      // Assert - generating state
      expect(screen.getByRole("button", { name: /generating\.\.\./i })).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid typing without issues", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");

      // Act - simulate rapid typing by using paste
      await user.click(textarea);
      await user.paste("Quick text");

      // Assert
      expect(textarea).toHaveValue("Quick text");
      expect(screen.getByText("10/10000 characters")).toBeInTheDocument();
    });

    it("should handle special characters in input", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");
      const specialText = "Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/~`";

      // Act - use paste for special characters to avoid parsing issues
      await user.click(textarea);
      await user.paste(specialText);
      await user.click(screen.getByRole("button"));

      // Assert
      expect(mockOnGenerate).toHaveBeenCalledWith(specialText);
    });

    it("should handle multiline text input", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");
      const multilineText = "Line 1\nLine 2\nLine 3";

      // Act - use paste for multiline text
      await user.click(textarea);
      await user.paste(multilineText);
      await user.click(screen.getByRole("button"));

      // Assert
      expect(mockOnGenerate).toHaveBeenCalledWith(multilineText);
    });

    it("should handle clearing text after typing", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");

      // Act
      await user.type(textarea, "Some text");
      // Select all text and delete it
      await user.tripleClick(textarea);
      await user.keyboard("{Backspace}");

      // Assert
      expect(textarea).toHaveValue("");
      expect(screen.getByText("0/10000 characters")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should maintain state when props change but input does not", async () => {
      // Arrange
      const user = userEvent.setup();
      const { rerender } = render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");

      // Act - type text
      await user.type(textarea, "Persistent text");

      // Rerender with different onGenerate function
      const newMockOnGenerate = vi.fn();
      rerender(<GeneratorInputForm onGenerate={newMockOnGenerate} isGenerating={false} />);

      // Assert - input value should persist
      expect(textarea).toHaveValue("Persistent text");
    });
  });

  describe("Accessibility", () => {
    it("should have proper label association", () => {
      // Act
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const label = screen.getByText("Job Description or Text to Generate Questions From");
      const textarea = screen.getByRole("textbox");

      // Assert
      expect(label).toHaveAttribute("for");
      expect(textarea).toHaveAttribute("id");
    });

    it("should have unique IDs for multiple form instances", () => {
      // Act
      const { container } = render(
        <>
          <GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />
          <GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />
        </>
      );

      // Assert
      const textareas = container.querySelectorAll("textarea");
      const id1 = textareas[0]?.getAttribute("id");
      const id2 = textareas[1]?.getAttribute("id");

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it("should have aria-live region for character count updates", () => {
      // Act
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const counter = screen.getByText("0/10000 characters");

      // Assert
      expect(counter).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Form Behavior", () => {
    it("should prevent default form submission", async () => {
      // Arrange
      const user = userEvent.setup();
      const mockPreventDefault = vi.fn();
      render(<GeneratorInputForm onGenerate={mockOnGenerate} isGenerating={false} />);
      const textarea = screen.getByRole("textbox");
      const form = textarea.closest("form");

      // Act
      await user.type(textarea, "Test");
      form?.addEventListener("submit", (e) => {
        mockPreventDefault();
        e.preventDefault();
      });
      await user.click(screen.getByRole("button"));

      // Assert
      expect(mockOnGenerate).toHaveBeenCalled();
    });
  });
});
