# Domainly AI — UI/UX Audit

Full scan of the UI/UX across the project: landing page, auth screens, dashboard shell, sidebar, chatbot widget, and shared components.

> **Brand note:** The project was being rebranded mid-audit (Pulseline → Domainly AI), which caused a brand split across the codebase. Per decision, **"Domainly AI" is canonical** — all copy, metadata, aria-labels, and SEO URLs now use it (`https://domainly.ai` assumed as the production domain — verify before deploying).

**Legend:** 🔴 Critical · 🟠 High · 🟡 Medium · ⚪ Low — Status: ✅ **fixed in this pass** · 📋 **recommended (not applied)**

---

## 🔴 Critical

### C1. Theme system conflict — light mode impossible
- **Where:** `src/app/globals.css`, `src/app/layout.tsx`
- **Issue:** CSS forced `html { @apply dark; }` and the `<html>` tag had a hardcoded `dark` class, so `next-themes` (ThemeProvider, `attribute="class"`) could never switch themes. Fonts were also loaded twice: `next/font/google` **and** a Google Fonts `@import` in globals.css (double network requests + FOUT risk).
- **Fix:** ✅ Removed the forced `dark` rule, removed the hardcoded `dark` class (ThemeProvider's `defaultTheme="dark"` still applies dark by default), and removed the duplicate `@import`.

### C2. Invisible text in dark mode (`text-black` on dark backgrounds)
- **Where:** `src/components/table/index.tsx` (table headers), `src/components/settings/payment-form.tsx` ("Payment Method" heading), `src/components/products/index.tsx` (Add Product button: `bg-orange` + `text-black` label overridden by `text-white` children)
- **Issue:** The app is dark-by-default; `text-black` renders near-invisible. Mixed hardcoded `bg-orange`/`text-white`/`text-black` breaks if the theme ever changes.
- **Fix:** ✅ Replaced with semantic tokens: `text-foreground`, `bg-primary text-primary-foreground`.

### C3. Invalid Tailwind class `text-3.5xl`
- **Where:** `src/components/dashboard/cards.tsx` (stat number)
- **Issue:** `text-3.5xl` doesn't exist in Tailwind — the value silently rendered at the inherited size, breaking the dashboard stat hierarchy.
- **Fix:** ✅ Changed to `text-3xl`.

### C4. Brand split — three names in one codebase ("Pulseline" / "Domainly AI" / pulseline.app)
- **Where:** navbar, footer, `src/app/layout.tsx` (metadata), landing copy, chatbot widget ("Domainly AI AI" double-brand), breadcrumb, mailer emails, package.json, README
- **Issue:** A concurrent rebrand (Pulseline → Domainly AI) left the brand inconsistent across the same pages and even inside single strings.
- **Fix:** ✅ Unified on **Domainly AI** everywhere (decision confirmed): all UI copy, metadata, aria-labels, alt text, console tags, comments, and the `Logo` component. SEO URLs (`metadataBase`, `robots.ts`, `sitemap.ts`) moved to `https://domainly.ai` — **verify this domain before deploy**.

### C5. Broken markup: `</Card>` closing tag left behind a `<div>`
- **Where:** `src/components/chatbot/real-time.tsx` (introduced mid-refactor; caught and repaired in this pass)
- **Fix:** ✅ Closing tag now matches; unused `Card` import removed.

---

## 🟠 High

### H1. No mobile navigation on the landing page
- **Where:** `src/components/navbar/index.tsx`
- **Issue:** Nav links were `hidden md:flex` with no hamburger — mobile users couldn't reach Features/Pricing/Blog/Docs.
- **Fix:** ✅ Mobile menu present (client state + hamburger, Clerk `SignedIn/SignedOut` aware). A separate `mobile-menu.tsx` I created was removed as redundant — the inline menu from the earlier navbar pass is kept.

### H2. Dead "Mobile App" desktop icon in the sidebar
- **Where:** `src/components/sidebar/minimized-menu.tsx`, `maximized-menu.tsx` (`MonitorSmartphone` item)
- **Fix:** ✅ Removed from both menus, unused import cleaned.

### H3. Console logging in production components
- **Where:** `src/components/chatbot/window.tsx`, `src/components/chatbot/bubble.tsx`
- **Fix:** ✅ Removed both `console.log`s.

### H4. Landing CTAs sent unauthenticated users into a protected route
- **Where:** `src/app/page.tsx` ("Start for free", "Get started free" → `/dashboard`)
- **Issue:** `/dashboard` is auth-gated, so visitors hit a redirect — a confusing first-run hop.
- **Fix:** ✅ Both hero/banner CTAs now point to `/auth/sign-up`. Pricing-card CTA kept on `/dashboard?plan=` for signed-in upgrades (see M8).

### H5. Wrong/unbranded bot avatar in chat bubbles
- **Where:** `src/components/chatbot/bubble.tsx`
- **Issue:** Assistant messages showed the shadcn GitHub avatar with fallback "CN" — off-brand.
- **Fix:** ✅ Replaced with the Pulseline pulse-mark SVG on `bg-primary/10`, `currentColor` stroke; unused `AvatarImage` import removed.

### H6. Generic "Submit" button + unstyled helper text on sign-in
- **Where:** `src/app/auth/sign-in/page.tsx`
- **Fix:** ✅ Button now says "Sign in"; helper text uses `text-muted-foreground` and the "Create one" link uses primary color.

### H7. Broken image when a domain has no icon
- **Where:** `src/components/sidebar/domain-menu.tsx`
- **Issue:** `<Image src={`https://ucarecdn.com/${domain.icon}/`}>` renders `ucarecdn.com/null/` when `icon` is null → broken-image icon in the sidebar.
- **Fix:** 📋 Guard it: `{domain.icon ? <Image …/> : <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-[10px]">{domain.name[0]?.toUpperCase()}</div>}`

### H8. Hardcoded logo text fill breaks under light theme
- **Where:** `src/components/navbar/index.tsx`, `src/app/page.tsx` (footer), `src/app/auth/layout.tsx` — logo SVGs use `fill="#ECEEF4"`
- **Issue:** Now that the theme system works again (C1), light mode renders a white wordmark on white background.
- **Fix:** 📋 Replace `fill="#ECEEF4"` with `className="fill-foreground"`; keep the ember stroke (brand accent, works in both themes).

### H9. Sidebar icons can't inherit color
- **Where:** `src/icons/*.tsx` (~20 icon files)
- **Issue:** Every stroke is hardcoded `stroke="#636363"`, so the active menu item styling in `menu-item.tsx` (`text-primary-foreground`) never affects the icons — they stay gray even when highlighted.
- **Fix:** 📋 Find/replace `stroke="#636363"` → `stroke="currentColor"` across `src/icons/`; icons then follow container color (active/hover/muted).

### H10. Dead links (Privacy, Terms, Contact)
- **Where:** `src/app/page.tsx` (footer)
- **Fix:** ✅ Navbar "Docs" → `/changelog`. 📋 Footer Privacy/Terms/Contact still `href="#"` — create minimal pages or use `mailto:`; dead links erode trust on a landing page.

---

## 🟡 Medium

### M1. Logo SVG duplicated in 6+ places
- **Where:** navbar, footer, auth layout, maximized-menu, not-found, menu-logo
- **Fix:** 📋 Extract `<Logo size="sm|md|lg" />` into `src/icons/logo.tsx`; also solves H8 in one place.

### M2. Non-functional Trash/Star buttons in InfoBar
- **Where:** `src/components/infobar/index.tsx`
- **Fix:** 📋 Wire them to real bulk actions or remove until the feature exists — misleading affordances.

### M3. Almost-invisible "off" state for the real-time Switch
- **Where:** `src/components/infobar/bread-crumb.tsx` — `data-[state=unchecked]:bg-peach` (primary at 15% alpha)
- **Fix:** 📋 Use `data-[state=unchecked]:bg-input`; keep `data-[state=checked]:bg-primary`.

### M4. Chat window fixed dimensions overflow small screens
- **Where:** `src/components/chatbot/window.tsx` — `h-[670px] w-[450px] mr-[80px]`
- **Issue:** On phones (~375px) and short laptops the customer-facing widget clips or needs scrolling.
- **Fix:** 📋 `w-[min(450px,calc(100vw-2rem))] h-[min(670px,80dvh)] mr-4` and reduce `mr-[80px]`.

### M5. `fill` Images lack `sizes`
- **Where:** `src/app/page.tsx` (blog thumbnails), chatbot images
- **Fix:** 📋 Add `sizes="(max-width: 768px) 100vw, 33vw"` to avoid oversized downloads + Next warnings.

### M6. Global `img { max-width: none }` override
- **Where:** `src/app/globals.css`
- **Fix:** 📋 Scope to `.chat-window img { max-width: none; }` and delete the global rule.

### M7. Blog excerpt slices raw HTML
- **Where:** `src/app/page.tsx` — `parse(post.content.slice(4, 120))`
- **Issue:** Slicing mid-tag emits broken markup.
- **Fix:** 📋 Strip tags first: `content.replace(/<[^>]*>/g, '').slice(0, 120)` and render as plain text.

### M8. Pricing CTA loses `?plan=` after auth redirect
- **Fix:** 📋 Route to `/auth/sign-up?plan=…` and forward, or persist intent in localStorage before redirect.

### M9. Dashboard stat math can render NaN
- **Where:** `src/app/(dashboard)/dashboard/page.tsx` — `value={products! * clients! || 0}`
- **Fix:** 📋 `value={(products ?? 0) * (clients ?? 0)}`.

### M10. Sidebar active-state misses nested routes
- **Where:** `src/components/sidebar/menu-item.tsx` — `isActive = current === path`
- **Issue:** On `/settings/mydomain`, Settings doesn't highlight.
- **Fix:** 📋 `current === path || current.startsWith(path + '/')`, with `path` normalized to a leading `/`.

### M11. Error boundary leaks raw error messages
- **Where:** `src/app/(dashboard)/error.tsx`
- **Fix:** 📋 Show a generic message; keep `error.digest` for support; log details server-side only.

### M12. Repetitive `opacity-0 delay-300 fill-mode-forwards` hack
- **Where:** sidebar menus (6 instances)
- **Fix:** 📋 Define a `.sidebar-fade-in` utility or wrapper component.

### M13. Global `*:focus-visible` outline fights shadcn rings
- **Where:** `src/app/globals.css`
- **Issue:** Double focus indicators + `border-radius: 4px` inside the rule mutates element radius on focus.
- **Fix:** 📋 Remove `border-radius` from the rule; unify on one focus system (global outline OR component rings).

---

## ⚪ Low

### L1. Typos / naming
- ✅ "Pipline Value" → "Pipeline Value" (`src/app/(dashboard)/dashboard/page.tsx`)
- 📋 `src/components/tabs/intex.tsx`, `src/components/accordian/`, `src/components/mondal/` — misspelled filenames (`intex` → `index`, `accordian` → `accordion`, `mondal` → `modal`); safe renames with import updates.

### L2. `RealTimeMode` badge misuses `Card`
- ✅ Replaced with a plain styled `div` (`bg-primary text-primary-foreground`) — Card border/shadow made the badge look heavy.

### L3. Footer year
- `new Date().getFullYear()` in a server component is fine today; just be aware it freezes if the page is ever statically exported.

### L4. Icon button accessibility
- 📋 Minimized sidebar items rely on `title` only; add `aria-label={label}` too. The navbar hamburger already has `aria-label` + `aria-expanded`. ✅

### L5. Auth pages have large top padding
- **Where:** `py-36` on sign-in/sign-up inside the split layout pushes forms low on short screens.
- 📋 Reduce to `py-16 lg:py-24` and center the form column.

### L6. Placeholder images
- 📋 `src/components/chatbot/window.tsx` hardcodes a `ucarecdn.com/…/propuser.png` image in the widget header — replace/remove; verify `/images/bot-ui.png` in `forms/settings/form.tsx` exists and is optimized.

### L7. Legacy color tokens in `tailwind.config.ts`
- **Where:** `cream`, `gravel`, `orange`, `peach`, `ironside`, etc. ("Legacy compat")
- 📋 After migrating the remaining `bg-orange` submit buttons in `forms/settings/filter-questions.tsx` and `forms/settings/help-desk.tsx` to `bg-primary`, delete the legacy block to prevent future misuse.

---

## ✅ Summary of fixes applied in this pass

| # | File | Change |
|---|------|--------|
| C1 | `globals.css`, `app/layout.tsx` | Theme conflict resolved; duplicate font import removed |
| C2 | `table/index.tsx`, `settings/payment-form.tsx`, `products/index.tsx` | `text-black`/`bg-orange` → semantic tokens |
| C3 | `dashboard/cards.tsx` | `text-3.5xl` → `text-3xl` |
| C4 | `navbar/index.tsx` | "Domainly AI" → "Pulseline" |
| C5 | `chatbot/real-time.tsx` | Broken `</Card>` repaired; unused import removed |
| H1 | `navbar/index.tsx` | Mobile menu kept/polished; dead `Docs` link → `/changelog` |
| H2 | `sidebar/*-menu.tsx` | "Mobile App" desktop icon removed |
| H3 | `chatbot/window.tsx`, `bubble.tsx` | `console.log`s removed |
| H4 | `app/page.tsx` | Landing CTAs → `/auth/sign-up` |
| H5 | `chatbot/bubble.tsx` | shadcn avatar → Pulseline mark |
| H6 | `auth/sign-in/page.tsx` | "Submit" → "Sign in" + styled helper text |
| L1 | `dashboard/page.tsx` | "Pipline" typo fixed |
| L2 | `chatbot/real-time.tsx` | Badge div instead of Card |

## ✅ Round 2 — implementation complete

All "📋 recommended" items below were subsequently implemented (TypeScript check: clean):

- **H7** — domain icon fallback: initial-letter avatar when no icon uploaded (`domain-menu.tsx`)
- **H8/M1** — `<Logo>` component created (`src/icons/logo.tsx`); replaced duplicated SVGs in navbar, footer, auth layout, maximized sidebar, chatbot avatar; wordmark uses `fill-foreground` (theme-safe)
- **H9** — all 19 icon files: `stroke="#636363"` → `stroke="currentColor"`; sidebar icons now follow active/hover colors
- **M3** — real-time Switch off-state: `bg-peach` → `bg-input`
- **M4** — chat widget responsive: `min(670px, 85dvh)` × `min(450px, 100vw-2rem)`, inner scroll area now `flex-1 min-h-0`
- **M5** — blog thumbnails got `sizes`
- **M6** — `img { max-width: none }` scoped to `.chat-window`
- **M7** — blog excerpt strips HTML before slicing (no more broken tags); `parse` import removed
- **M9** — pipeline value: `(products ?? 0) * (clients ?? 0)`
- **M10** — sidebar active state uses `usePathname()`; highlights nested routes like `/settings/mydomain`; `aria-label` added to both menu variants
- **M11** — error boundary shows a generic message (no raw `error.message` leak)
- **L7** — every legacy token usage migrated (`bg-orange`/`bg-peach`/`bg-platinum`/`bg-grandis`/`bg-cream`/`bg-porcelain`/`text-ironside`/`border-orange` across email-marketing, portal booking, portal stepper, dark-mode picker, user-type card, premium pill, code snippet, appointment page); the legacy block was **deleted from `tailwind.config.ts`**
- **L4/L5** — menu item `aria-label`s; auth pages `py-36` → `py-16 lg:py-24`
- **Copy** — "Pipline"→"Pipeline", "Confrim"→"Confirm", "The anwer"→"The answer", "Your emails not match"→"Emails do not match"; stray `console.log` in `blogs/[id]` removed
- **C4 rebrand finished** — see brand note at top

## Remaining (lower priority, not blocking)
- `frontend-audit.md` (separate, pre-existing doc) tracks deeper functional issues: double-submit patterns in portal/checkout flows, sign-up wizard schema-step bug, keyboard accessibility for theme/plan radios, stale `corinna-*` assets in `public/images`.



