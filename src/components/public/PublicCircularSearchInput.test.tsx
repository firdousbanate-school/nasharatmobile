import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PublicCircularSearchInput } from "./PublicCircularSearchInput";

vi.mock("next-intl", () => ({
  useTranslations: () => () => "البحث في التعاميم...",
}));

describe("PublicCircularSearchInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with placeholder and triggers onChange", () => {
    const handleChange = vi.fn();
    render(<PublicCircularSearchInput value="" onChange={handleChange} />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("placeholder", "البحث في التعاميم...");

    fireEvent.change(input, { target: { value: "امتحان" } });
    expect(handleChange).toHaveBeenCalledWith("امتحان");
  });

  it("renders clear button when value is present and clears on click", () => {
    const handleChange = vi.fn();
    render(<PublicCircularSearchInput value="test" onChange={handleChange} />);

    const clearBtn = screen.getByRole("button", { name: "Clear search" });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith("");
  });
});
