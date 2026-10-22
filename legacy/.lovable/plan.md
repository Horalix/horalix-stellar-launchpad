

# FAQ Section Implementation Plan

This plan implements a complete FAQ section for SEO and GEO optimization, including database schema, frontend component, admin CMS, and structured data for search engines.

---

## Overview

The FAQ section will be an accordion-style component placed directly below the Contact section on the homepage. It will display questions and answers fetched from the database, include JSON-LD structured data for SEO, and have a full admin interface for content management.

---

## Implementation Steps

### 1. Database Schema

Create the `faq_items` table with RLS policies for secure access.

```text
Table: faq_items
+-------------+-------------+---------------------------+
| Column      | Type        | Details                   |
+-------------+-------------+---------------------------+
| id          | uuid        | PK, auto-generated        |
| created_at  | timestamptz | default now()             |
| updated_at  | timestamptz | default now()             |
| page        | text        | NOT NULL (e.g., "home")   |
| question    | text        | NOT NULL                  |
| answer      | text        | NOT NULL                  |
| sort_order  | int         | default 0                 |
| is_published| boolean     | default true              |
+-------------+-------------+---------------------------+
```

**RLS Policies:**
- Public can read published FAQ items
- Admins/Editors can perform all operations

**Initial Data:** The 12 FAQ items provided will be seeded into the table.

---

### 2. Frontend Component

Create `src/components/home/FAQSection.tsx`:

- Uses shadcn/ui Accordion component
- Fetches FAQ items where `page = "home"` and `is_published = true`
- Orders by `sort_order` ascending
- Section has `id="faq"` for deep linking
- Generates JSON-LD FAQPage schema from items
- Renders nothing if no FAQ items exist (graceful fallback)
- Matches existing section styling patterns (similar to SolutionsSection)

**Component Structure:**
```text
<section id="faq">
  - Section header with icon and title
  - JSON-LD script injection via SEO component
  - Accordion with question/answer pairs
  - Loading spinner during fetch
  - Empty state (renders nothing for public users)
</section>
```

---

### 3. Homepage Integration

Modify `src/pages/Index.tsx`:

- Import FAQSection component
- Add FAQSection below ContactSection

---

### 4. Admin CMS Page

Create `src/pages/admin/FAQManager.tsx`:

- Table view listing all FAQ items (question, page, sort_order, status)
- Create/Edit dialog with fields:
  - Question (required)
  - Answer (required, textarea)
  - Page (default "home")
  - Sort Order (number input)
  - Is Published (switch toggle)
- Delete functionality with confirmation
- Uses same patterns as NewsManager (Dialog, Table, mutations)

---

### 5. Admin Navigation

Modify `src/components/admin/AdminLayout.tsx`:

- Add "FAQ" navigation item linking to `/admin/faq`

---

### 6. App Routing

Modify `src/App.tsx`:

- Add route for `/admin/faq` pointing to FAQManager

---

### 7. Build Error Fix

Fix existing build error in `src/pages/NewsArticle.tsx`:

- Remove reference to non-existent `article.author` property
- The `news_articles` table has `author_id` but no `author` column

---

## Technical Details

### JSON-LD Schema Format

The FAQ section will inject structured data following Google's FAQPage schema:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Horalix, in one sentence?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Horalix is clinical AI software..."
      }
    }
  ]
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/home/FAQSection.tsx` | Homepage FAQ accordion component |
| `src/pages/admin/FAQManager.tsx` | Admin CMS for FAQ management |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add FAQSection import and render |
| `src/App.tsx` | Add /admin/faq route |
| `src/components/admin/AdminLayout.tsx` | Add FAQ nav item |
| `src/pages/NewsArticle.tsx` | Fix author property error |

### Database Migration

- Create `faq_items` table
- Enable RLS
- Add policies for public read and admin management
- Add trigger for `updated_at` auto-update
- Seed initial 12 FAQ items

---

## Styling Approach

The FAQ section will follow the existing design language:
- Dark theme with border/card styling
- Monospace accent text for section label
- Space Grotesk font for headings
- Consistent padding and spacing (py-24, px-6)
- Accordion with hover states matching brand colors

