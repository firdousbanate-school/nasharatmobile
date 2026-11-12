import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { mockSubmitDirect, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockSubmitDirect: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock("./submitDocumentDirect", () => ({
  submitDocumentDirect: (...args: unknown[]) => mockSubmitDirect(...args),
}));

import { useDocumentFormSubmit } from "./useDocumentFormSubmit";

describe("useDocumentFormSubmit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects files over 25 MB on the client before submitting", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDocumentFormSubmit({
        slug: "operational-plan",
        onSuccess,
        onClose,
      }),
    );

    const oversizedFile = new File(["x"], "large.pdf", { type: "application/pdf" });
    Object.defineProperty(oversizedFile, "size", { value: 26 * 1024 * 1024 });

    act(() => {
      result.current.setTitle("Operational Plan");
      result.current.setFile(oversizedFile);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockSubmitDirect).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe("fileTooLarge");
    expect(result.current.isSubmitting).toBe(false);
    expect(mockToastError).toHaveBeenCalledWith("fileTooLarge");
  });

  it("calls submitDocumentDirect and resets isSubmitting on error result", async () => {
    mockSubmitDirect.mockResolvedValueOnce({
      success: false,
      error: "Upload failed directly",
    });

    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDocumentFormSubmit({
        slug: "operational-plan",
        onSuccess,
        onClose,
      }),
    );

    const validFile = new File(["%PDF-1.4"], "plan.pdf", { type: "application/pdf" });

    act(() => {
      result.current.setTitle("Operational Plan");
      result.current.setFile(validFile);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errorMessage).toBe("Upload failed directly");
    expect(mockToastError).toHaveBeenCalledWith("Upload failed directly");
  });
});
