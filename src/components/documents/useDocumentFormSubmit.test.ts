import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { mockCreateAction, mockUpdateAction, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockCreateAction: vi.fn(),
  mockUpdateAction: vi.fn(),
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

vi.mock("@/actions/documents/createSchoolDocumentAction", () => ({
  createSchoolDocumentAction: mockCreateAction,
}));

vi.mock("@/actions/documents/updateSchoolDocumentAction", () => ({
  updateSchoolDocumentAction: mockUpdateAction,
}));

import { useDocumentFormSubmit } from "./useDocumentFormSubmit";

describe("useDocumentFormSubmit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects files over 20 MB on the client before submitting", async () => {
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
    Object.defineProperty(oversizedFile, "size", { value: 21 * 1024 * 1024 });

    act(() => {
      result.current.setTitle("Operational Plan");
      result.current.setFile(oversizedFile);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockCreateAction).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe("fileTooLarge");
    expect(result.current.isSubmitting).toBe(false);
    expect(mockToastError).toHaveBeenCalledWith("fileTooLarge");
  });

  it("catches transport errors and resets isSubmitting instead of throwing unhandled rejection", async () => {
    mockCreateAction.mockRejectedValueOnce(new Error("Unexpected end of form"));

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
    expect(result.current.errorMessage).toBe("Unexpected end of form");
    expect(mockToastError).toHaveBeenCalledWith("Unexpected end of form");
  });
});
