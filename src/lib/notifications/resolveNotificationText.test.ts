import { describe, it, expect } from "vitest";
import { resolveNotificationText } from "./resolveNotificationText";

describe("resolveNotificationText", () => {
  const translations: Record<string, string> = {
    "templates.circular_published.title": "New Administrative Circular",
    "templates.circular_published.body": "A new circular has been published",
    "templates.circular_reminder.title": "Urgent Reminder",
    "templates.circular_reminder.bodyDefault": "Pending circulars need response",
    "templates.maintenance_assigned.title": "New Maintenance Request",
    "templates.maintenance_assigned.body": "A request has been assigned to you",
  };

  const mockT = (key: string, values?: Record<string, string | number>) => {
    if (key === "templates.circular_published.bodyWithRef") {
      return `Published #${values?.ref} (${values?.title})`;
    }
    if (key === "templates.circular_reminder.bodyWithRef") {
      return `Review #${values?.ref} (${values?.title})`;
    }
    if (key === "templates.maintenance_created.bodyWithTitle") {
      return `Submitted: ${values?.title}`;
    }
    if (key === "templates.maintenance_status_updated.bodyWithTitle") {
      return `Ticket (${values?.title}) -> ${values?.status}`;
    }
    if (key === "templates.maintenance_status_updated.bodyWithStatus") {
      return `Status -> ${values?.status}`;
    }
    if (key === "templates.calendar_published.bodyWithTitle") {
      return `Calendar: ${values?.title}`;
    }
    return translations[key] ?? key;
  };

  it("translates canonical template key for published circular", () => {
    const res = resolveNotificationText(
      { title: "circular_published", body: "circular_published" },
      mockT,
    );
    expect(res.title).toBe("New Administrative Circular");
    expect(res.body).toBe("A new circular has been published");
  });

  it("translates published circular with structured ref and title", () => {
    const res = resolveNotificationText(
      {
        title: "circular_published",
        body: JSON.stringify({ ref: "2026/05", title: "Exam Policy" }),
      },
      mockT,
    );
    expect(res.title).toBe("New Administrative Circular");
    expect(res.body).toBe("Published #2026/05 (Exam Policy)");
  });

  it("translates legacy Arabic string for published circular", () => {
    const res = resolveNotificationText(
      {
        title: "تعميم إداري جديد",
        body: "تم نشر تعميم إداري جديد يتطلب مراجعة واستجابة قسمكم",
      },
      mockT,
    );
    expect(res.title).toBe("New Administrative Circular");
    expect(res.body).toBe("A new circular has been published");
  });

  it("translates circular reminder with structured JSON body", () => {
    const res = resolveNotificationText(
      {
        title: "circular_reminder",
        body: JSON.stringify({ ref: "C-12", title: "Meeting" }),
      },
      mockT,
    );
    expect(res.title).toBe("Urgent Reminder");
    expect(res.body).toBe("Review #C-12 (Meeting)");
  });

  it("translates maintenance assignment notification", () => {
    const res = resolveNotificationText(
      { title: "maintenance_assigned", body: "maintenance_assigned" },
      mockT,
    );
    expect(res.title).toBe("New Maintenance Request");
    expect(res.body).toBe("A request has been assigned to you");
  });

  it("translates maintenance creation and status update notifications", () => {
    const created = resolveNotificationText(
      {
        title: "maintenance_created",
        body: JSON.stringify({ title: "AC Leak", priority: "high" }),
      },
      mockT,
    );
    expect(created.title).toBe("templates.maintenance_created.title");
    expect(created.body).toBe("Submitted: AC Leak");

    const updated = resolveNotificationText(
      {
        title: "maintenance_status_updated",
        body: JSON.stringify({ title: "AC Leak", status: "resolved" }),
      },
      mockT,
    );
    expect(updated.title).toBe("templates.maintenance_status_updated.title");
    expect(updated.body).toBe("Ticket (AC Leak) -> resolved");
  });

  it("translates calendar publish notification with event title", () => {
    const res = resolveNotificationText(
      {
        title: "calendar_published",
        body: JSON.stringify({ title: "Science Fair" }),
      },
      mockT,
    );
    expect(res.title).toBe("templates.calendar_published.title");
    expect(res.body).toBe("Calendar: Science Fair");
  });

  it("preserves unmapped custom titles and bodies as fallback", () => {
    const res = resolveNotificationText(
      { title: "System Maintenance", body: "Server update at midnight" },
      mockT,
    );
    expect(res.title).toBe("System Maintenance");
    expect(res.body).toBe("Server update at midnight");
  });
});
