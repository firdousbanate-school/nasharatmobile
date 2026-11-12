import { ValidationError } from "@/lib/errors/ValidationError";
import type { UpdateMaintenanceInput } from "./updateMaintenanceAction";

export function validateMaintenanceUpdateInput(input: UpdateMaintenanceInput): void {
  if (!input.title?.trim()) {
    throw new ValidationError("Title is required");
  }
  if (!input.description?.trim()) {
    throw new ValidationError("Description is required");
  }
}
