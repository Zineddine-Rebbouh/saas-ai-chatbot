# Frontend audit — DomainlyAI

> Snapshot taken 2026-09-14 ~00:30–01:00 UTC. Audit is static (file reads + `tsc`, `lint`, `build`); no code was changed.
> **Volatility warning:** files under `src/` were being modified by an outside process *during* this audit
> (mtimes 00:26–00:31 UTC, still writing at 00:31:46). Line numbers below are best-effort and may have drifted by a few lines.
> Re-run `npm run build` on a quiet tree before trusting the build section verbatim.

## Build/run status

- **Node:** v24.19.0 / npm 10.8.1. Next 14.2.3 officially supports Node 18.17+ / 20 — Node 24 is untested territory, expect warnings (Edge-runtime `setImmediate`/`MessageChannel` warnings from Clerk/scheduler, stale `caniuse-lite` DB). Not fatal.
- **`npx tsc --noEmit` (incl. `--incremental false`): PASS, zero errors.**
- **`npm run lint`: 12 warnings, 0 errors** — all `react-hooks/exhaustive-deps` in `portal-form.tsx`, `use-sidebar.tsx`, `use-billing.ts`, `use-chatbot.ts` (×2), `use-conversation.ts` (×3), `use-marketing.ts` (×2), `use-settings.ts` (×2).
- **`npm run build`: FAILS — and non-deterministically, because the tree was moving mid-build:**
  - Run 1 failed at lint stage: `'Logo' is not defined` in `src/app/auth/layout.tsx:21`, `src/app/page.tsx:365`, `src/components/sidebar/maximized-menu.tsx:26`. On disk, `page.tsx` *does* `import Logo from '@/icons/logo'` (line 4) while `auth/layout.tsx` and `maximized-menu.tsx` use `<Logo>` with **no import** — half-finished rebrand fallout. `src/icons/logo.tsx` exists (named + default export).
  - Run 2 (minutes later, no edits by this agent) passed lint and failed at type-check: `menu-item.tsx:16 'current' is possibly 'undefined'`. The file on disk by then contained *different code* (rewritten to `usePathname()`) — i.e. an external edit landed between the two runs.
- **`npm run dev` was not left running** (would just be the same lint/type gate plus Clerk/DB env requirements). Local `.env` exists but key names **diverge from `.env.example`** (see High finding on `PUSHER_APP_CLUSTOR`).
- Bottom line: **the app does not currently produce a production build.** Primary blockers are the `Logo` missing-import errors (when the tree is quiet) plus whatever the background edits are still changing. `dev` may serve despite these (Next dev is laxer), but treat the tree as unstable until the external writes stop.

## Summary

~150 findings. Approximate counts (deduped across the three passes):

| Severity | Count | Meaning |
|----------|-------|---------|
| High | ~40 | Broken functionality, crashes, data-loss / double-charge risk, route 404s |
| Medium | ~60 | Confusing UX, missing loading/error/empty states, accessibility blockers, silent failures |
| Low | ~50 | Cosmetic inconsistencies, dead code, minor a11y/perf polish |

Biggest clusters: **booking/payment flow can double-submit and double-charge** (portal), **sign-up wizard submits the wrong schema step** (auth), **chatbot realtime/embed handshake is fragile** (chatbot), **email-marketing can double-send campaigns**, **dark-mode bypassed by hardcoded colors** in ~8 components, **brand split three ways** (Domainly AI / Pulseline / pulseline.app), **14/16 pages have no metadata**.

## Findings by route

### 1. Landing page (`app/page.tsx`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| Med | Bug | Pricing CTA `href=/dashboard?plan=${card.title}` case-mismatch | `src/app/page.tsx:253` | Sends `Ultimate` etc; billing code expects `STANDARD/PRO/ULTIMATE` |
| Med | Bug | Footer `Privacy/Terms/Contact` are `href="#"` dead links | `src/app/page.tsx:379-381` | No such route files; jump-to-top |
| Low | Bug | Unused import `parse` (`html-react-parser`) | `src/app/page.tsx:19` | Stripping done via regex instead; remove |
| Low | Bug | `new Date().getFullYear()` inline in render | `src/app/page.tsx:375` | SSR/CSR boundary flicker; hoist to const |
| Med | Missing state | Blog `src` becomes `undefined…` if env missing | `src/app/page.tsx:331-335` | `` `${process.env.CLOUDWAYS_UPLOADS_URL}${post.image}` `` with no fallback breaks `next/image` |
| Low | Missing state | Blog block renders nothing when empty, no empty state | `src/app/page.tsx:300` | `posts.length>0` only; currently masked by mocks |
| Med | UI | Brand split: body `Domainly AI` vs footer `© Pulseline` | `src/app/page.tsx:45,104,159,281,375` | Pick one canonical brand |
| Low | A11y | `text-xs` eyebrow/social-proof on glow background | `src/app/page.tsx:90,128,291` | Contrast risk, esp. light mode |
| Med | UI | `metadataBase/siteName https://pulseline.app` vs `title Domainly AI` | `src/app/layout.tsx:22-37` | Same split; also `creator @domainlyai` |
| Low | UI | `.glass` hardcodes white `rgba(255,255,255,…)` | `src/app/globals.css:199-204` | Fights light mode; use token |
| Low | UI | `.gradient-ember/.text-gradient-ember` duplicate `--ember/--accent` tokens | `src/app/globals.css:185-196` | Delete duplicates |
| — | — | Fonts/theme/focus otherwise clean | `src/app/layout.tsx:8-18`, `globals.css:20-93` | `display:swap`, `suppressHydrationWarning`, visible `:focus-visible` — no issues |

### 2. Auth: sign in / sign up (`app/auth/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Bug | `<Logo>` used with no import — **build breaker** | `src/app/auth/layout.tsx:21` | Add `import Logo from '@/icons/logo'` |
| Low | Bug | Unused `Image` import | `src/app/auth/layout.tsx:2` | Never rendered |
| Med | Bug | `import {currentUser} from '@clerk/nextjs'` deprecated path | `src/app/auth/layout.tsx:1` | Should be `@clerk/nextjs/server` on Next 14 |
| Med | Bug | Sign-in copy false: "You will receive a one time password" | `src/components/forms/sign-in/login-form.tsx:17-19` | Flow is email+password, no OTP |
| High | Bug | `error.errors[0].code` unguarded; non-`form_password_incorrect` errors silent | `src/hooks/sign-in/use-sign-in.ts:37-39` | Non-Clerk/network throw crashes instead of toast |
| Med | Bug | Success path never `setLoading(false)`; `status!=='complete'` (2FA) unhandled | `src/hooks/sign-in/use-sign-in.ts:29-35` | Dead branch |
| Med | Missing state | Submit button has no `disabled`/loading state | `src/app/auth/sign-in/page.tsx:16-21` | Whole form swaps to spinner — jarring, no anti-double-submit |
| High | Bug | Wizard steps 1/2 `Continue` are `type="submit"` + `onClick next` | `src/components/forms/sign-up/button-handlers.tsx:74-82,45-58` | Submits full schema (OTP `min(6)`) on step 1; only step 3 should submit |
| Med | Bug | Step 2 gates on `isDirty` not `isValid` | `src/components/forms/sign-up/button-handlers.tsx:16-18,48-57` | Invalid email still calls `onGenerateOTP`; Clerk error only |
| Low | Perf | `ButtonHandler` instantiates second `useSignUpForm()` | `src/components/forms/sign-up/button-handlers.tsx:14` | Duplicates `useForm`/Clerk hook from provider |
| Med | Bug | `setValue('otp',onOTP)` during render | `src/components/forms/sign-up/registration-step.tsx:31` | Side-effect in render; move to `useEffect` |
| Low | Bug | Fallback `<div>RegistrationFormStep</div>` placeholder | `src/components/forms/sign-up/registration-step.tsx:58` | Unreachable dead text if step out of range |
| High | Bug | `use-sign-up` catch reads `error.errors[0].longMessage` unguarded, no `setLoading(false)` | `src/hooks/sign-up/use-sign-up.ts:43-48,90-95` | Any non-Clerk throw crashes; spinner stuck forever |
| High | Bug | `onHandleSubmit` incomplete path returns `{message}` with no toast/reset | `src/hooks/sign-up/use-sign-up.ts:61-63` | `loading` stays `true` forever |
| Med | Missing state | `onGenerateOTP` has no loading/disabled | `src/hooks/sign-up/use-sign-up.ts:27-49` | Double-click fires double `signUp.create` |
| Med | A11y | `UserTypeCard` radio uses `className="hidden"` — removed from tab order | `src/components/forms/sign-up/user-type-card.tsx:66-74` | Use `sr-only` |
| Low | UI | `border-orange` legacy token; typo `Confrim Password` | `user-type-card.tsx:32,40`, `constants/forms.ts:44` | Use `border-primary`; fix copy |
| Low | UI | Zod message "Your emails not match" grammar | `src/schemas/auth.schema.ts:38-41` | Copy fix |
| Med | Bug | Password regex `/^[a-zA-Z0-9_.-]*$/` rejects symbols | `src/schemas/auth.schema.ts:27-30,71-74` | Blocks valid passwords; conflicts with Clerk rules |
| — | — | Inline-error wiring otherwise clean | `auth.schema` + `form-generator` | Zod + `ErrorMessage` present on sign-in/up |
| — | — | `them-provider`, `use-auth-context` | `src/context/them-provider.tsx`, `use-auth-context.tsx` | No issues found |

### 3. Dashboard overview (`app/(dashboard)/dashboard/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| Med | Bug | 6 sequential `await`s waterfall; `plan?.plan!` crashes if null | `app/(dashboard)/dashboard/page.tsx:23-28,67` | `Promise.all` + guard |
| Low | Bug | `Props={}` unused; `console.log(credits)` / `console.log(planFeatures)` left in | `app/(dashboard)/dashboard/page.tsx:20`, `components/dashboard/plan-usage.tsx:17`, `components/settings/billing-settings.tsx:20` | Delete |
| Low | Bug | `See more` `<button>` has no `onClick` — dead | `app/(dashboard)/dashboard/page.tsx:81` | Wire or remove |
| Med | Missing state | No per-section error handling; `transactions.data.length` assumes `data`; `PlanUsage` crashes if `plan` undefined | `app/(dashboard)/dashboard/page.tsx:85-86,66-71` | Global `error.tsx` covers route, not partial failure |
| Low | UI | `text-[10px]` timestamp; `grid lg:grid-cols-2` with no `gap` (cards touch) | `app/(dashboard)/dashboard/page.tsx:95,58` | `text-xs`, `gap-6` |
| Low | Bug | `toLocaleDateString()` in server component — locale differs server/client | `app/(dashboard)/dashboard/page.tsx:96` | Pin locale `en-US` + `timeZone` |
| — | — | `loading.tsx` skeleton + `error.tsx` with `reset` exist | `app/(dashboard)/loading.tsx`, `error.tsx` | Genuinely covered |

### 4. Conversation inbox / live chat (`app/(dashboard)/conversation/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Bug | `ConversationSearchSchema` requires `query` but no `query` input exists | `schemas/conversation.schema.ts:14-18`, `components/conversations/search.tsx:18-36` | Form never valid; validation dead |
| High | Bug | `ChatBotMessageSchema.refine` returns `undefined` on invalid image (typo `entery`) | `schemas/conversation.schema.ts:29-41` | Generic error, no field UI; `return false` + `path:['image']` |
| High | Bug | `image?: any`, `z.any()`, `bind((data:any))` mask shape errors | `schemas/conversation.schema.ts:11,27`, `hooks/conversation/use-conversation.ts:141` | Type as `FileList` / pusher payload |
| Med | Bug | React-illegal `<option selected>`; no `label`/`aria-label` on filter select | `components/conversations/search.tsx:22-26` | `defaultValue` + `<Label>` |
| Med | Bug | `onHandleSentMessage`: `reset()` before `await`, `chatRoom!` + `values.content` possibly `undefined` | `hooks/conversation/use-conversation.ts:152-159` | Lost draft on failure; crash risk — reset after success, guard |
| Med | Bug | `urgent` only if message <2h old; `onSeenChat` requires `urgent` → old unreads never marked seen | `hooks/conversation/use-conversation.ts:91-106` | Mark seen on open regardless |
| Med | Bug | `loading` stuck `true` if `!mode`/`!rooms` (reset only inside `if`) | `hooks/conversation/use-conversation.ts:44-46` | `finally`/else reset |
| Med | Missing state | Tabs `all`/`expired`/`starred` render literal placeholder strings; typo `No chats for you domain` | `components/conversations/index.tsx:55-75,50` | Real lists or remove tabs |
| Med | Missing state | `Messenger`: no error state; `Send` has no `processing` disable | `components/conversations/messenger.tsx:69-75` | Double-submit on rapid Enter |
| Med | Missing state | No Zod inline errors in `Messenger` (empty submit silently passes — schema allows empty) | `components/conversations/messenger.tsx:61-66` | Show `errors.content` |
| Med | UI | `ChatCard` whole `Card onClick` not keyboard-operable; `Paperclip` button dead, no label, ~18px | `components/conversations/chat-card.tsx:29-32`, `messenger.tsx:52-58` | `role=button tabIndex onKeyDown`; 40px + label |
| Low | UI | Unused `Input` import (raw `<input>` used); raw input has no label | `components/conversations/messenger.tsx:6,61` | Remove import, add `aria-label` |
| Low | UI | `text-[10px]` timestamps (×2) | `components/conversations/chat-card.tsx:56`, `messenger.tsx:87` via `bubble.tsx:87` | Bump to `text-xs` |
| Med | A11y | User-link `text-white` hardcoded — fails in light mode | `src/components/chatbot/bubble.tsx:73-74` | `text-primary-foreground` |
| Low | Bug | External `Link target=_blank` without `rel`; timestamp contrast risk | `bubble.tsx:71-81,86-95` | Add `rel="noopener"` |
| Low | Bug | `new Date()` in render for fallback timestamp → SSR/CSR drift | `components/chatbot/bubble.tsx:18,90-94` | Pass `createdAt` or memo |
| Low | Perf | Inbox + message lists unmemoized (fine at small N) | `components/conversations/index.tsx:38`, `messenger.tsx:30` | `React.memo(ChatCard/Bubble)` when large |

### 5. Appointment calendar (`app/(dashboard)/appointment/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Bug | "Today" filter compares `getDate()` only — Dec 15 matches Jan 15 / any year | `app/(dashboard)/appointment/page.tsx:27-29` | Compare `toDateString()` or a day range |
| High | Bug | Time format `getHours()>12?'PM':'AM'` wrong at noon (12→AM), unpadded `9 5` | `app/(dashboard)/appointment/page.tsx:58-60`, `components/appointment/all-appointments.tsx:46` | `>=12`, 12h mod, `padStart` |
| Med | Bug | `AvatarFallback{booking.email[0]}` throws if `email==''` | `app/(dashboard)/appointment/page.tsx:70` | `booking.email?.[0] ?? '?'` |
| Med | Missing state | `if(!user) return null` blank page; `if(!domainBookings)` misses `bookings=[]` + error case | `app/(dashboard)/appointment/page.tsx:16,20-25` | Sign-in CTA + error slot |
| Med | UI | No calendar UI at all — list + "today" list only; `ui/calendar.tsx` never used in route | `app/(dashboard)/appointment/page.tsx:34-84` | Wire `Calendar` or rename route |
| Med | UI | `DataTable` has no `overflow-x-auto` wrapper → 4-col table overflows 375px; `CardDescription` directly under `DataTable` (invalid table HTML) | `components/appointment/all-appointments.tsx:28,55-57` | Scroll wrapper + `TableRow/TableCell colSpan` empty row |
| Low | UI | `lg:grid-cols-3` + `h-0` — right rail pushes page on mobile | `app/(dashboard)/appointment/page.tsx:34-35` | `lg:h-0 lg:overflow-hidden` |

### 6. Email marketing / campaigns (`app/(dashboard)/email-marketing/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Bug | `campaign!` / `subscription!` / `domains!` crash on first-run null | `app/(dashboard)/email-marketing/page.tsx:19-23` | `?? []` + empty CTA |
| High | Bug | `setDefault('description',…)` during render → render loop | `components/email-marketing/edit-email.tsx:31` | `useEffect(()=>setValue,…,[template])` |
| High | Bug | `useAnswers`/`useEditEmail` `useEffect []` never refetches when `id` changes | `hooks/email-marketing/use-marketing.ts:174-176,198-200` | Deps `[id]`, guard `if(!id) return` |
| Med | Bug | `onAddCustomersToCampaign` with no `campaignId` calls API with `undefined!` | `components/email-marketing/index.tsx:70-74`, `hooks/email-marketing/use-marketing.ts:84-87` | `disabled={!campaignId}` + guard toast |
| Med | Bug | `onBulkEmail` has zero loading/disable → double-send blasts customers | `hooks/email-marketing/use-marketing.ts:112-125`, `components/email-marketing/index.tsx:162-173` | `sendingId` state + disable |
| Med | Bug | `loading`/`processing`/`editing` stuck `true` on catch (log-only) | `hooks/email-marketing/use-marketing.ts:47-63,84-100` | `try/finally` + error toast |
| Med | Missing state | Zero campaigns → blank right column; customer table no empty state; `Answers []` renders nothing | `components/email-marketing/index.tsx:114-179`, `customer-table.tsx:36-70`, `answers.tsx:15-26` | Empty CTAs; error slot |
| Med | Missing state | `Loader loading={false}` hardcoded — dead loading branch | `components/email-marketing/index.tsx:81` | Remove or wire |
| High | UI | `min-w-[600px]` campaign cards force horizontal scroll at 375px | `components/email-marketing/index.tsx:120` | `min-w-0 w-full` |
| High | UI | Hardcoded light colors ignoring dark mode: `bg-gray-50`, `bg-grandis/hover:bg-orange/text-gray-700`, `bg-orange/bg-peach` | `components/email-marketing/index.tsx:121,149`, `customer-table.tsx:45,56` | Theme tokens (`bg-primary/…`, `bg-muted`) |
| Med | UI | `Card w-5 h-5` (20px) used as checkbox; `View` trigger small | `components/email-marketing/customer-table.tsx:41-47,55-60` | 40px `Checkbox`/`Switch` |
| Med | A11y | Selector has no `role=checkbox`/`aria-checked`/keyboard; shared `id={isId}` across row sheets | `components/email-marketing/customer-table.tsx:39-67` | Real `Checkbox` per row |
| Low | Bug | `campaign[i].customers.map(c=>c)` redundant; answers `key={key}` index + `&&` in map emits `false` nodes | `components/email-marketing/index.tsx:167`, `answers.tsx:19-24` | `.filter().map`, stable keys |
| Low | Perf | Campaign + customer lists unmemoized; `EditEmail` mounts fetch per card (N fetches) | `components/email-marketing/index.tsx:116,154` | Fetch lazily on modal open, memo rows |

### 7. Integrations (`app/(dashboard)/integration/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Bug | `return_url:'http://localhost:3000/settings'` ships to prod | `hooks/billing/use-billing.ts:80,185` | `window.location.origin+'/settings'` (also see §8/§10) |
| Med | Bug | `loadStripe(...)` inside render — new promise every render | `components/settings/stripe-elements.tsx:15` | Hoist to module scope |
| Med | Bug | `StripeElements` returns `false` (blank) when `STANDARD` or secret pending | `components/settings/stripe-elements.tsx:17-31` | Explicit `null` + helper text |
| Med | Missing state | `StripeConnect`/`PaymentForm` errors only via `console.log`; Payment `Button` no `disabled={processing}` | `components/settings/stripe-connect.tsx:14-21`, `payment-form.tsx:26-28`, `hooks/billing/use-billing.ts:85-86,191` | Disable + error toast/inline |
| Low | Bug | `connections={{stripe: payment?true:false}}` verbose; prop typo `descrioption` | `app/(dashboard)/integration/page.tsx:8-10`, `components/integrations/IntegrationTrigger.tsx:12` | `!!payment`, rename |
| Low | Bug | `Learn more` button dead (no `onClick`) | `components/integrations/integration-modal-body.tsx:37` | Wire docs URL or remove |
| Med | UI | `gap-x-20` forces 375px overflow; `Image sizes=100vw + fill` unoptimized, generic `alt="Logo"` | `components/integrations/index.tsx:20,23-28` | `gap-4`, fixed `width/height`, `alt={item.name}` |
| Low | UI | Trigger `Card px-3 py-2` (~32px) under 40px touch | `components/integrations/IntegrationTrigger.tsx:32-35` | `min-h-10` |
| Low | A11y | Status text lowercase, no `aria-live` | `components/integrations/IntegrationTrigger.tsx:34`, `mondal/index.tsx:36-54` | Capitalize + live region |
| — | — | Sidebar `integration` path exists; `key=item.id` correct | `constants/integrations.ts:10-21` | No dead-link issue |

### 8. Settings (domain & billing) (`app/(dashboard)/settings/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Bug | `domains[0]` + `plan!` crash on zero domains; `BillingSettings` blank-returns if `!planFeatures` | `app/(dashboard)/settings/[domain]/page.tsx:21-24`, `components/settings/billing-settings.tsx:18` | Guard length + empty/error UI |
| High | Bug | Password fields `type="text"` — plaintext exposure | `components/settings/change-password.tsx:27-42` | `type="password"` + `autoComplete=new-password` |
| High | Bug | Delete Domain has no confirm step — one click destroys | `components/forms/settings/form.tsx:90-97` | `AlertDialog` confirm (`ui/alert-dialog.tsx` exists, unused) |
| High | Bug | Code snippet hardcodes `http://localhost:3000` (`iframe.src`, `e.origin`) | `components/forms/settings/code-snippet.tsx:31,36,40` | Inject `NEXT_PUBLIC_APP_URL` |
| Med | Bug | `values.image?.[0]` guard missing — domain-only/welcome-only save crashes | `hooks/settings/use-settings.ts:106`, `hooks/sidebar/use-domain.ts:38` | Optional-chain both |
| Med | Bug | `DomainSettingsSchema`/`ChatBotMessageSchema` refines return `undefined` instead of `false` | `schemas/settings.schema.ts:65-78` | Explicit `return false` |
| Med | Bug | `any` on `image` fields + `UseFormRegister<any>`; `price: z.string()` accepts `""`/`"abc"` | `schemas/settings.schema.ts:8,19,107`, `components/upload-button/index.tsx:9`, `components/forms/form-generator/index.tsx:15` | `FileList` + `z.coerce.number().positive()` |
| Med | Bug | `placeholder={name/message}` instead of `defaultValue` → untouched save overwrites with `""` | `components/forms/settings/domain-update.tsx:22`, `greetings-message.tsx:25` | `defaultValue` |
| Med | Bug | `ProductTable`: `$` on name column, price bare | `components/products/index.tsx:74-75` | Swap `$` to price cell |
| Med | Bug | `ProductTable` `Live`/`Deactivated` tabs have zero `TabsContent` → blank panel | `components/products/index.tsx:40-41,62-84` | Add contents or drop tabs |
| Med | Missing state | All settings submits stay enabled while loading → double-submit | `help-desk.tsx:63`, `filter-questions.tsx:62`, `change-password.tsx:43`, `product-form.tsx:69` | `disabled={loading}` |
| Med | Missing state | Settings hooks catch→`console.log` only, `loading` stuck | `hooks/settings/use-settings.ts:70,290` + throughout | `finally` + toast |
| High | UI | `bg-cream` badge + snippet block unreadable in dark mode; `border-orange` dots ignore theme | `components/forms/settings/form.tsx:59`, `code-snippet.tsx:50-62`, `settings/dark-mode.tsx:27,36,45` | `bg-muted/border-primary` |
| High | UI | Fixed widths overflow 375px: `DomainUpdate w-[400px]`, snippet `px-10` + `pre` no scroll | `components/forms/settings/domain-update.tsx:14`, `code-snippet.tsx:50-63` | `max-w-full overflow-x-auto` |
| Med | UI | Bare `Copy` icon button (~24px, no label/keyboard); clipboard-deny unhandled | `components/forms/settings/code-snippet.tsx:51-60` | `<button aria-label>` `min-h-10` + try/catch |
| Low | UI | Generic `alt="image"/"bot"`; card `400×400` unresponsive; typo `The anwer…` | `billing-settings.tsx:46-51`, `edit-chatbot-icon.tsx:35`, `filter-questions.tsx:49` | Descriptive alt, `sizes`, copy fix |
| High | A11y | Theme pickers + plan radio are `div`/`hidden input onClick` — no keyboard, no `role=radiogroup` | `components/settings/dark-mode.tsx:24-50`, `settings/subscription-card.tsx:57-63` | Real `RadioGroup` + buttons |
| Low | A11y | `FormGenerator` `id=input-${label}` → `input-undefined` dupes when label omitted; stray `import {strict} from 'assert'` + `defualt:` dead label | `components/forms/form-generator/index.tsx:3,46,120` | `id=name`-based; remove import/typo |
| Low | Bug | `FormGenerator` swallows `Required` errors (`message==='Required' ? ''`) | `components/forms/form-generator/index.tsx:58,88,114` | Required fields show nothing; remove guard |
| Low | Perf | `WelcomeMessage dynamic(ssr:false)` correct — no action | `components/forms/settings/form.tsx:14-19` | — |

### 9. Embeddable chatbot widget (`app/chatbot/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | A11y | Launcher is `div onClick` — no role/keyboard/label | `src/components/chatbot/index.tsx:46-52` | `<button aria-label="Open chat">` |
| Low | A11y/Perf | `alt="bot"` vague; `fill` without `sizes` | `src/components/chatbot/index.tsx:54-58` | Descriptive alt + `sizes` |
| High | Bug | `domainName.split('.com')[0]` crashes pre-fetch; `currentBot?.helpdesk!` may be undefined | `src/components/chatbot/window.tsx:88`, `:34,169` | Guard undefined bot state |
| Low | Bug | `errors:any`, unused `help`, deprecated `objectFit` prop | `src/components/chatbot/window.tsx:23,69,102` | `style={{objectFit}}`; remove `help` |
| Med | A11y | Chat `Input` placeholder-only, no label; `Send` icon-only no `aria-label`, no `disabled` while sending | `src/components/chatbot/window.tsx:134-144` | Labels + disable |
| Low | Bug | `key={key}` index on chats/products | `window.tsx:121` | Append-only so low risk |
| Low | UI | `Avatar w-20 h-20` oversized header; `text-[10px] Powered by` | `window.tsx:77,180` | Scale down; ≥12px |
| Med | UI | Title `Domainly AI AI` duplicated word | `src/components/chatbot/window.tsx:86` | Copy fix |
| Med | UI | `Responding` uses `shadcn.png` / `@shadcn` / `CN` placeholder branding | `src/components/chatbot/responding.tsx:8-12` | Replace with product brand |
| High | Bug | `values.image.length` throws on text-only send (schema `image?`) | `src/hooks/chatbot/use-chatbot.ts:112` | `values.image?.length` |
| High | Bug | `let limitRequest=0` resets every render — once-guard never holds; listener never cleaned | `src/hooks/chatbot/use-chatbot.ts:80,99-107` | `useRef` + cleanup |
| Med | Bug | `window.addEventListener('message')` no cleanup, trusts any `string`; `postMessage('*')` | `use-chatbot.ts:98-107`, `lib/utils.ts:31-33` | Validate `origin`; allowlist |
| Med | Bug | `currentBotId!` may be undefined; `setOnChats((prev:any)` masking | `use-chatbot.ts:127-131,116,143,151,178` | Chat-before-`botid` breaks |
| Med | Bug | `useRealTime` `[]` deps drops first event via `counterRef`; won't resub on room change | `use-chatbot.ts:214-233` | Fix deps; don't skip index 0 |
| Low | Bug | Leftover `console.log`s | `use-chatbot.ts:100,110,113,125,217` | Remove |
| Low | A11y | `RealTimeMode` badge not `aria-live` | `src/components/chatbot/real-time.tsx:21` | Screen readers miss live msgs |
| — | — | `src/app/chatbot/page.tsx` trivial server wrapper | `src/app/chatbot/page.tsx:1-10` | No issues found |
| — | — | `user-chat-context` provider unused on chatbot route | `src/context/user-chat-context.tsx` | Dead for scoped routes; local state used instead |

### 10. Public customer portal (`app/portal/[domainid]/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Missing state | `if (!questions) return null` — blank page, no loading/empty/error | `appointment/[customerid]/page.tsx:14`, `payment/[customerid]/page.tsx:19` | Full state trio missing |
| Med | Bug | `email!` / `stripeId!` / `amount!` non-null assertions | `appointment:19`, `payment:23-29`, `product-checkout.tsx:32-38` | Null email/products breaks booking/Stripe intent |
| Med | Missing state | Payment with zero products renders empty column | `product-checkout.tsx:49-67` | "No products" state |
| High | Bug | `setValue('date',date)` during render | `src/hooks/portal/use-portal.ts:27` | Move to `useEffect` |
| High | Bug | `catch(error){}` silent; `loading` stuck (`setLoading(false)` only inside `if(savedAnswers)`) | `use-portal.ts:63,61` | Toast + reset |
| High | Missing state | `useForm()` with no resolver — questions accept empty, `error` prop never populated | `use-portal.ts:15-20`, `questions.tsx:24-36` | Add Zod or `required` |
| Med | UI | Progress uses `bg-orange/bg-platinum`, fixed `w-[400px]` | `portal-form.tsx:92-102` | Legacy tokens ignore theme; overflows 360px |
| High | Bug | Booked-slot check mismatch: visual uses date/month compare, `disabled` uses `booking.date==date` reference equality | `booking-date.tsx:71-93` | `disabled` never true — booked slots selectable |
| High | Bug | `booking.date.getDate()` assumes `Date` object | `booking-date.tsx:73-75` | RSC serializes to string → crash; parse first |
| Low | Bug | `key={key}` on slots/products | `booking-date.tsx:61`, `product-checkout.tsx:50` | Use `slot.slot`/`product.name` |
| Med | A11y | Slot radio `className="hidden"` inside clickable `Card` | `booking-date.tsx:82-99` | `sr-only`; `Label` already ok |
| Med | Missing state | `Book Now` not `disabled={!slot||loading}` | `booking-date.tsx:114-116` | Double-book risk |
| Med | Perf | `loadStripe()` in render — new promise each render | `product-checkout.tsx:32-37` | Hoist/memoize |
| Low | A11y/Perf | Product `alt="product"` generic; `fill` without `sizes` | `product-checkout.tsx:56-60` | Descriptive alt |
| High | Bug | `Pay` is `type="submit"` inside portal `<form onSubmit={onBookAppointment}>` + `onClick onMakePayment` | `payment-form.tsx:17-23`, `portal-form.tsx:66-69` | Pay also triggers booking flow; isolate forms or `type="button"` |
| High | Missing state | Pay never `disabled` while `processing` — double-charge risk | `payment-form.tsx:17-23` | `Loader` only wraps label |
| Med | UI | `PortalBanner` `width={0} height={0}` + `alt="LOGO"` + legacy `/images/logo.png` | `src/components/portal/banner.tsx:7-17` | Sized `next/image` + shared `Logo` |
| Med | UI | Portal layout `md:h-screen` + `h-0 mt-12` collapses oddly on mobile | `src/app/portal/layout.tsx:10-12` | Review breakpoints |
| Low | UI | Hardcoded `text-red-400`, `text-gray-600`, `bg-gray-300`, `border-orange` | `form-generator:57`, `portal-steps:100`, `booking-date:78-79` | `destructive`/`muted` tokens |
| Low | Bug | `FormGenerator register: UseFormRegister<any>`; stray `defualt:` label after `return` | `form-generator/index.tsx:15,120` | `any` masking; dead code |

### 11. Blog pages (`app/blogs/`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Bug | **No `src/app/blogs/page.tsx`** — nav `Blog`, landing `View all`, sitemap `/blogs` all 404 | `components/navbar/index.tsx:11`, `app/page.tsx:312`, `app/sitemap.ts:20` | Only `[id]` exists; add index or remove links |
| High | Bug | `post?.createdAt.getMonth()!` crashes when `post` undefined | `src/app/blogs/[id]/page.tsx:16-18` | `post?.createdAt?.getMonth()` (+ date/year) |
| High | Bug | `getMonthName(getMonth())` off-by-one — `getMonth()` is 0–11, fn expects 1–12; Dec returns `false` | `src/lib/utils.ts:43-67` + `blogs/[id]/page.tsx:16` | Verified in source; Jan shows nothing, every month shifted |
| High | Missing state | Invalid id → empty title, no `notFound()`/error UI | `src/app/blogs/[id]/page.tsx:9-25` | `onGetBlogPost` can return `undefined` |
| Low | Bug | Leftover `console.log(parse(…))` | `src/app/blogs/[id]/page.tsx:11` | Debug in prod |
| Med | Bug | `parse(post?.content)` may receive `undefined` → throws | `src/app/blogs/[id]/page.tsx:21` | Guard first |
| Med | UI | `text-6xl` fixed, `lg:w-6/12` narrow, no mobile scale | `src/app/blogs/[id]/page.tsx:14,19` | `text-3xl md:text-6xl` etc. |

### Layout / sidebar / infobar (dashboard shell)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| High | Bug | `<Logo>` with no import — **build breaker** | `components/sidebar/maximized-menu.tsx:26` | Add import (same as `auth/layout`) |
| High | Bug | Domain link `href=/settings/${domain.name.split('.')[0]}` collides (`acme.com`+`acme.io`→same), breaks `co.uk`; `[domain]/page` then `redirect('/dashboard')` | `components/sidebar/domain-menu.tsx:74` | Use `domain.id` or full `name` |
| Med | Bug | `any` masks event bug: `e.target.ariaChecked == 'true'` string-compare on `Switch` | `context/use-sidebar.tsx:20-24` | `onCheckedChange(checked:boolean)` |
| Med | Bug | `page=pathname.split('/').pop()` returns domain slug on `/settings/[domain]` → wrong breadcrumb, `Switch` hidden | `context/use-sidebar.tsx:53`, `components/infobar/bread-crumb.tsx:23,38-48` | Parse segment[1] |
| Med | Bug | Sign-out `MenuItem` falls back to `href='#'` | `components/sidebar/menu-item.tsx:34,50` | Render `<button>` when no `path` |
| Med | Missing state | No error UI on domain create / realtime toggle — `console.log` only | `hooks/sidebar/use-domain.ts:36-48`, `context/use-sidebar.tsx:33-34` | Toast + reset `loading` |
| Low | Bug | Unused destructured `expand,onExpand,onSignOut` in breadcrumb | `components/infobar/bread-crumb.tsx:12-18` | Remove |
| Low | Bug | `key={key}` menu maps; `JSX.Element` for `icon` (deprecated) | `maximized-menu.tsx:40`, `minimized-menu.tsx:37`, `menu-item.tsx:10` | Stable keys, `ReactNode` |
| Med | UI | Expanded 300px sidebar overlays content on mobile, no backdrop/close; `expand=undefined` initial → Min→Max jump | `components/sidebar/index.tsx:26-30`, `tailwind.config.ts:111-114` | Backdrop + default `false` |
| Med | UI | Add-domain form `w-6/12` squeezes at 375px; `+` trigger 24px | `components/sidebar/domain-menu.tsx:43,36` | `w-full sm:w-6/12`, 40px |
| Med | UI | Trash/Star buttons dead (no `onClick`), misleading | `components/infobar/index.tsx:16-20` | Wire or remove |
| Med | A11y | `Switch` uncontrolled + `onClick` → out of sync, no `aria-label` | `components/infobar/bread-crumb.tsx:29-33` | Controlled + label |
| Med | A11y | `Menu` svg / `MenuLogo` toggle not keyboard-focusable | `maximized-menu.tsx:32-35`, `minimized-menu.tsx:32-34` | `<button aria-label>` |
| Low | UI | `text-[10px]` fallback avatar initial | `components/sidebar/domain-menu.tsx:91` | ≥12px |

### Misc routes (`not-found`, `changelog`, `navbar`)

| Severity | Category | Issue | File/line | Notes |
|----------|----------|-------|-----------|-------|
| Low | Bug | Unused `Radio` import; decorative svg needs `aria-hidden` | `src/app/not-found.tsx:2,12,28` | Minor |
| — | — | `not-found` otherwise clean (valid targets, themed, responsive) | `not-found.tsx:56-70` | No issues |
| Low | A11y | Changelog tags `text-blue-400/amber-400/emerald-400` low contrast on light | `src/app/changelog/page.tsx:27,38` | Use tokens |
| — | — | `changelog` otherwise clean | `changelog/page.tsx:99-129` | No issues |
| Med | UI | Mobile nav toggle `p-2` ≈36px <40px | `src/components/navbar/index.tsx:65-72` | `min-h-10 min-w-10` |
| Low | A11y | Mobile dropdown no Esc-close/focus return (`aria-expanded` present — good) | `navbar:77-115` | Minor |
| Low | Perf | Whole navbar `'use client'` — required for Clerk/toggle, acceptable | `navbar:1` | No action |

## Cross-cutting issues

- **Half-finished rebrand blocks the build.** `<Logo>` without import in `auth/layout.tsx`, `maximized-menu.tsx` (and lint-flagged `page.tsx` on one run); brand split `Domainly AI` (titles/body) vs `Pulseline` (footer, logo SVG text, `aria-labels`) vs `pulseline.app` (metadata). `menu-logo.tsx:16` says `Domainly AI` while `logo.tsx` says `Pulseline`. Zero `Corinna` strings left in `src`, but stale assets remain (`public/images/corinna-ai-logo.png`, `iphonecorinna.png`).
- **Dark mode bypassed in 8+ components:** `bg-cream`/`text-gray-400..700` (settings form, code snippet), `bg-grandis`/`hover:bg-orange`/`bg-orange`/`bg-peach`/`bg-platinum` (email-marketing, portal stepper), `text-white` user chat link (bubble), `text-red-400` errors (form-generator), `bg-gray-50` campaign cards, `.glass` white in `globals.css`. Tokens (`muted`, `primary`, `destructive`) already exist — use them.
- **Double-submit / stuck-loading pattern everywhere:** portal Pay + Book Now, sign-up OTP, bulk-email send, all settings forms, messenger send, `use-billing`/`use-marketing`/`use-settings` catches that `console.log` and leave `loading=true`. Standard fix per site: `disabled={loading}` + `try/finally` + error toast.
- **Render-phase side effects:** `setValue` during render (`registration-step`, `use-portal`, `edit-email` via `setDefault`), `setValue('date',…)` in hook body. All need `useEffect`.
- **Missing `"use client"` discipline:** `subscription-card`, `minimized/maximized-menu`, `otp/index`, `chatbot/window`, `chatbot/bubble` handle `onClick`/`onSubmit`/`register` with no directive — working only via implicit parent boundary (`sidebar/index`, `chatbot/index`). One refactor away from a runtime throw.
- **Dead shared code:** `src/lib/features.config.ts` flags never consumed; icons `copy/devices/documents/money` never imported; ~13 shadcn `ui/*` modules (alert, breadcrumb, carousel, command, context-menu, menubar, navigation-menu, pagination, radio-group, resizable, skeleton, slider, sonner) + `AlertDialog` (which delete-domain needs!) never imported.
- **Unprotected / misprotected routes:** `/blogs/*` has no index yet requires auth (logged-out nav click → Clerk redirect); `/chatbot` ignored by middleware (intentional for embed) but handshake has no origin check (`postMessage('*')`, `code-snippet` hardcodes `localhost:3000` origin).
- **Env config trap:** code reads `NEXT_PUBLIC_PUSHER_APP_CLUSTOR` (misspelled) — local `.env` matches the typo so it works locally, but `.env.example` documents `CLUSTER`, so any fresh setup gets `undefined` cluster and realtime silently dies. Same unguarded-`as-string` pattern for UploadCare key and Stripe publishable key (blank-page/no-error failure modes).
- **SEO:** 14/16 pages export no `metadata`; `sitemap.ts` lists protected `/dashboard` and nonexistent `/blogs`; layout missing `icons`/`viewport`/`themeColor`/`canonical`/share images.
- **Shared-component defects with wide blast radius:** `UploadButton` hardcoded `id="upload-button"` (duplicate IDs when Domain + Settings + Product forms coexist); `DataTable` no `overflow-x-auto`/`<caption>`/index keys; `TabsMenu` filename typo `intex.tsx` + crash on empty triggers; `FormGenerator` `input-undefined` IDs + swallowed `Required` errors; `menu-item.tsx` `current` possibly-undefined (failed build run 2).

## Recommended fix order

1. **Freeze the tree** — stop the background writes/OneDrive sync, commit or stash the rebrand WIP, then re-run `npm run build` on a quiet tree to get a stable baseline.
2. **Unbreak the build** — add missing `Logo` imports (`auth/layout`, `maximized-menu`); fix `menu-item` `current` guard; create `blogs/page.tsx` *or* remove its three links; fix `blogs/[id]` crash + `getMonthName` off-by-one.
3. **Money & data-loss bugs** — portal Pay/booking double-submit + booked-slot `disabled` mismatch + `booking.date` string crash; email-marketing double-send + `campaign!` asserts; delete-domain confirm; settings password `type="text"`; sign-up wizard submit types + stuck `loading`.
4. **Silent-failure cleanup** — `try/finally` + toasts + `disabled={loading}` across `use-portal`, `use-marketing`, `use-settings`, `use-billing`, `use-sign-in/up`; fix `CLUSTOR` naming (code + `.env` + `.env.example` together) and guard UploadCare/Stripe/Pusher keys with visible error states.
5. **Render-phase & realtime correctness** — `setValue`→`useEffect` (3 sites); `limitRequest`→`useRef` + listener cleanup; `useRealTime` deps/first-event; `useEffect [id]` in marketing hooks; appointment today-filter + noon-format fixes.
6. **Brand + dark mode + responsive pass** — one canonical brand (metadata, logo, footer, aria-labels, remove Corinna assets); replace hardcoded colors with tokens (8 components); fix `min-w-[600px]`, `w-[400px]`, `w-6/12`, `gap-x-20` mobile overflows; `PortalBanner` 0×0 image.
7. **A11y + SEO sweep** — launcher/slot/theme controls to real buttons + `sr-only` radios + `aria-label`s; chatbot `aria-live`; metadata for all pages; sitemap/robots consistency; `rel="noopener"` on `_blank` links.
8. **Dead-code & hygiene** — `features.config.ts`, unused icons, unused shadcn imports (keep the files, they're the library), `console.log`s, `Loader loading={false}`, `Learn more`/`See more`/Trash/Star dead buttons, `intex.tsx` rename, `UploadButton useId()`, `DataTable` scroll wrapper.

*Nothing above has been fixed — awaiting your prioritization.*
