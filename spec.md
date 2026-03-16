# BizDox — Template Library Seeder Module

## Current State

The platform has a working admin panel with routes for Templates, Form Builder, Placeholders, Theme Manager, Payments, and Analytics. The backend supports full CRUD for templates, formFields, placeholders, themes, and documents. The document creation flow has 4 steps (select template → fill form → choose theme → preview/generate). The preview (Step 3) currently renders as a flat key-value list — no structured layout. The admin sidebar has 8 items; no Template Library section exists. There are no pre-seeded templates or themes in the system.

## Requested Changes (Diff)

### Add
- Backend: `seedStandardTemplates()` — admin-only function that creates 10 trade templates, their form fields, placeholder mappings, and 5 default themes with upsert/skip-duplicate safety
- Backend: `getSeedStatus()` — returns count of seeded templates already present for UI feedback
- Frontend route: `/admin/template-library` → `TemplateLibraryPage`
- Frontend page: `TemplateLibraryPage.tsx` — shows seed status, "Import Standard Templates" button, progress feedback, list of what will be seeded
- Frontend component: `DocumentPreviewRenderer.tsx` — renders a structured HTML document preview (header, buyer/seller table, commodity table, pricing, shipping, footer/signatures) styled by selected theme
- Sidebar: Add "Template Library" with Library icon to admin nav (12 total admin items)

### Modify
- `App.tsx`: Add `/admin/template-library` route (admin-only)
- `Sidebar.tsx`: Add Template Library nav item to admin section
- `CreateDocumentPage.tsx` Step 3: Replace flat key-value preview with `DocumentPreviewRenderer` component that applies theme colors/font and renders structured document sections

### Remove
- Nothing removed

## Implementation Plan

1. **Backend (`main.mo`)**: Add `seedStandardTemplates` and `getSeedStatus` public functions. The seeder defines all 10 templates inline (Proforma Invoice, Commercial Invoice, Sales Contract, Purchase Contract, Packing List, Commodity Specification Sheet, Cashew Kernel Offer Sheet, Inspection Certificate, Broker Commission Agreement, LC Draft). For each template: check if name exists before creating; create form fields with correct types and options; create placeholder tokens mapped to fieldIds. For themes: check by name before creating. Return a result record with counts of created vs skipped items.

2. **Frontend `TemplateLibraryPage.tsx`**: Admin-only page with a card showing the 10 template names to be seeded, current seed status from `getSeedStatus()`, and an "Import Standard Templates" button. Button triggers `seedStandardTemplates()` mutation, shows loading spinner, success/error feedback via toast.

3. **Frontend `DocumentPreviewRenderer.tsx`**: Takes `fields: {label, value, placeholder}[]`, `templateName: string`, `theme: Theme | null`. Detects document type from template name and renders the appropriate structured layout: branded header with company name (from seller_name field), document title, reference number and date, buyer/seller 2-column table, commodity details table, pricing section, shipping/payment section, footer with signature blocks. Theme colors, fonts, and border styles applied inline.

4. **Frontend `CreateDocumentPage.tsx`**: Import and use `DocumentPreviewRenderer` in Step 3 replacing the flat list. Pass `selectedTemplate.name`, `fieldValues`, `fields`, and `selectedTheme`.

5. **Frontend `App.tsx`**: Add `template-library` case to admin route switch.

6. **Frontend `Sidebar.tsx`**: Add Template Library item after Analytics in admin nav.
