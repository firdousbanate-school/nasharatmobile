The solution I recommend is to build an **in-app PDF viewer** directly into your application.

You should be able to click a PDF file and see it inside your app, without:

- Downloading the PDF.
- Opening a new browser tab.
- Leaving the current page.
- Redirecting to Google Drive or another external viewer.

Recommended solution: PDF.js

Use Mozilla's **PDF.js** library to render PDF pages directly inside your application's interface.

[Features – 20+ Vue PDF Features | Vue PDF Viewer](https://images.openai.com/static-rsc-4/1TE59S2ZC5LHLaP9iZZ38Pm0Lo1S7KJzOJ9eSEgeA6kHJoAdfYzZ2p-PxmLI5QjRKpNjWIz_BTpxcSJufnhUZZoNEqZt6BsEF3dPHTcZfJUqkgAQMMHmSgBXlbE3YVx4yAwA_d_yBr0-lKOzwTayX8muH2ElXokbsn8Pi3Ag7W0?purpose=inline)

[vue-pdf-viewer.dev](https://www.vue-pdf-viewer.dev/features?utm_source=chatgpt.com)

## **Recommended implementation

I recommend:

1. **PDF.js** for rendering the document.
2. A React modal or full-screen overlay for the viewer.
3. An authenticated server endpoint to retrieve the PDF from Supabase Storage.
4. Render pages inside the modal using PDF.js, not a browser PDF tab.

This preserves the existing authentication and access-control model.

## **1. Expected user experience**

**Document Preview**

Page 1 of 12

100%

Document content rendered directly inside the application.

PDF page content

Illustrative design of the proposed in-app viewer

## **2. Technical implementation**

| Component         | Solution                         |
| ----------------- | -------------------------------- |
| PDF rendering     | Mozilla PDF.js                   |
| React integration | `react-pdf`                      |
| Viewer interface  | Existing application modal       |
| File retrieval    | Authenticated Next.js API        |
| File storage      | Existing private Supabase bucket |
| Authorization     | Existing RBAC and Supabase RLS   |

Install:

```
npm install react-pdf pdfjs-dist
```

The implementation should:

# Task: Implement a Universal In-App PDF Preview System

## Objective

Implement a complete, production-ready PDF viewing experience directly inside the application.

Users must be able to open and read PDF documents without:

- Downloading files to their devices.
- Opening a new browser tab or window.
- Leaving the current application page.
- Redirecting to an external PDF viewer.
- Depending on third-party online PDF viewing services.

## 1. Application Compatibility

First, inspect the existing application architecture, including:

- Frontend framework and UI architecture.
- Backend and API structure.
- Authentication and authorization mechanisms.
- File storage and document retrieval mechanisms.
- Existing document and attachment components.
- Existing design system and modal/dialog components.

Use the technologies and architectural patterns already established in the application.

Do not unnecessarily replace existing infrastructure.

## 2. PDF Rendering

Use a reliable PDF rendering solution, preferably Mozilla PDF.js or an appropriate framework integration such as React-PDF when using React.

The viewer must render PDF pages directly inside the application's interface rather than relying on the browser's native PDF viewer.

## 3. Viewer Features

Implement a complete PDF viewer with:

- Previous and next page navigation.
- Direct page number navigation.
- Zoom in and zoom out.
- Fit to width and fit to page.
- Full-screen viewing.
- Text selection and copying.
- Text search within the document.
- Page count display.
- Loading progress indicators.
- Meaningful error messages.
- Responsive desktop, tablet and mobile layouts.
- Keyboard navigation.
- Appropriate accessibility support.
- Support for Arabic, RTL and other Unicode text.

Where practical, support thumbnails, document rotation and printing.

## 4. User Interface and Experience

- Open PDFs in an integrated modal, dialog or dedicated in-app viewing panel.
- Maintain the current page context when opening and closing the viewer.
- Preserve the user's scroll position.
- Allow switching between documents without unnecessarily closing the viewer.
- Provide a clear close button.
- Use the application's existing design system.
- Ensure the viewer works consistently across all relevant application sections.

## 5. Security and File Access

Integrate with the application's existing authentication and authorization system.

Requirements:

- Verify user permissions before providing document access.
- Respect existing role-based access controls.
- Respect private storage and access policies.
- Retrieve protected documents securely.
- Do not expose secret keys, access tokens or credentials in frontend code.
- Prevent unauthorized document access.
- Handle expired sessions and inaccessible documents gracefully.

Do not make private files publicly accessible just to enable PDF previews.

## 6. Performance and Reliability

- Load PDF documents efficiently.
- Avoid loading all pages unnecessarily for large documents.
- Use page virtualization or lazy rendering where appropriate.
- Release PDF resources when the viewer closes.
- Handle large files and slow network connections.
- Avoid unnecessary repeated API requests.
- Prevent memory leaks.
- Provide useful loading and retry states.

## 7. Integration Requirements

Inspect the entire application and identify every place where PDF documents can be:

- Attached.
- Uploaded.
- Listed.
- Accessed.
- Viewed.
- Referenced.

Integrate the new viewer consistently across all relevant entry points.

Do not limit implementation to a single page or module.

Preserve existing functionality, including file uploads, downloads and document management.

## 8. Restrictions

- Do not force PDF downloads for preview.
- Do not use `window.open()` for PDF previews.
- Do not use `target="_blank"` for PDF previews.
- Do not open PDFs in another browser tab.
- Do not redirect users to external PDF viewer websites.
- Do not break existing authentication, authorization or file-storage functionality.

## 9. Testing and Quality Assurance

Test the implementation with:

- Single-page PDFs.
- Multipage PDFs.
- Large PDF documents.
- Scanned/image-based PDFs.
- Arabic and RTL documents.
- Documents containing tables and images.
- Invalid or corrupted PDFs.
- Expired authentication sessions.
- Unauthorized document requests.
- Slow network connections.
- Desktop and mobile devices.

Run the application's existing linting, type checking, automated tests and production build.

Fix all issues introduced by the implementation.

## 10. Final Deliverables

Provide:

1. A reusable, fully functional PDF viewer.
2. Integration across all relevant application sections.
3. Secure document retrieval.
4. Responsive and accessible UI.
5. Tests covering essential functionality and security.
6. A list of modified and newly created files.
7. A summary of implementation decisions.
8. Test and production-build results.

## Final Instruction

Inspect the existing application before making changes. Adapt the implementation to its actual architecture and technology stack.

Implement the complete feature end-to-end. Do not deliver only a prototype, mockup, placeholder, or standalone viewer component.

The final result must allow users to preview PDF documents seamlessly inside the application without downloading them or opening another tab.

- Render PDF pages inside the application.
- Support multiple pages and page navigation.
- Support zoom in/out and fit-to-width.
- Support text selection and searching.
- Support full-screen viewing.
- Work on desktop, tablets and mobile.
- Support Arabic PDFs and RTL application layouts.
- Show loading indicators and meaningful error messages.
- Preserve existing permissions and private document access.

**Important:** Do not expose the Supabase service-role key in client-side code. PDF requests must go through an authenticated, permission-checked server route or an appropriately authorized short-lived URL.

## **3. Instructions to give GitHub Copilot / coding agent**

Here is a ready-to-use implementation request.

# Task: Implement a Complete In-App PDF Preview System

Repository: `elnewahy2025/School-Administration-Portal`

Implement a production-ready PDF viewer directly inside the existing application.

## Core requirement

Users must be able to preview PDF documents without:

- Downloading the document.
- Opening another browser tab.
- Navigating away from the current page.
- Using an external PDF viewer.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Mozilla PDF.js
- react-pdf
- Existing Supabase Storage and authentication infrastructure.

## Implementation requirements

1. Create a reusable PDF viewer component.
2. Display the viewer in a responsive modal or full-screen overlay.
3. Integrate PDF preview into every existing UI location where users can view PDF attachments, especially Administrative Circulars.
4. Retrieve documents through authenticated server-side access.
5. Verify user permissions and existing RBAC before serving documents.
6. Keep private Supabase storage buckets private.
7. Never expose service-role credentials to the browser.

## Viewer features

- Page navigation.
- Zoom in/out.
- Fit to width.
- Full-screen mode.
- Text selection and search.
- Loading progress.
- Error handling.
- Responsive desktop and mobile layouts.
- Arabic and RTL compatibility.
- Optional printing through an explicit print action.

## User experience

- Clicking a PDF attachment opens the viewer immediately.
- Closing the viewer returns the user to exactly the same page and scroll position.
- Switching between PDF attachments should not require closing the viewer.
- Do not use window\.open(), target="\_blank", or external Google Drive viewers.
- Do not force document downloads.

## Security

- Preserve existing authentication, RBAC and Supabase RLS.
- Validate document access on the server for every request.
- Use private, authenticated file delivery.
- Avoid exposing permanent public URLs.
- Prevent unauthorized users from accessing attachments.

## Quality assurance

- Test small and large PDF documents.
- Test multipage documents.
- Test Arabic documents.
- Test expired sessions and unauthorized access.
- Test desktop and mobile.
- Run existing lint, typecheck, unit tests and build.
- Add appropriate tests for the new viewer.

## Important

Inspect the existing source code before implementation. Reuse existing components, design tokens, modal infrastructure and attachment APIs. Do not create duplicate document-management functionality or break existing download and printing features.

Implement the complete solution, not just a demonstration component. Update all relevant PDF preview entry points and provide a summary of changed files and test results.

## **4. How I recommend proceeding**

Don't replace your existing document storage or authentication system. Add PDF preview as a new presentation layer on top of the existing secure file infrastructure.

That way, the change fixes the viewing experience without unnecessarily changing your backend.

I can also help review the implementation against your actual GitHub code and check that every PDF attachment entry point uses the new viewer.
