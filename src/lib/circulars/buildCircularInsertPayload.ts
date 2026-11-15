import type { CircularPriority, CircularResponseType, CircularVisibility } from "./types";

export function buildCircularInsertPayload(params: {
  schoolId: string;
  refNum: string;
  title: string;
  body: string;
  priority: CircularPriority;
  visibility?: CircularVisibility;
  responseType: CircularResponseType;
  dueAt: string | null;
  createdBy: string;
  canPublish?: boolean;
}) {
  const initialStatus = params.canPublish === false ? "draft" : "published";
  const publishAt = initialStatus === "published" ? new Date().toISOString() : null;

  const basePayload = {
    school_id: params.schoolId,
    ref_number: params.refNum,
    title: params.title,
    body: params.body,
    priority: params.priority,
    status: initialStatus,
    publish_at: publishAt,
    response_type: params.responseType,
    due_at: params.dueAt,
    created_by: params.createdBy,
  };

  return {
    basePayload,
    payloadWithVisibility: {
      ...basePayload,
      visibility: params.visibility ?? "internal",
    },
  };
}
