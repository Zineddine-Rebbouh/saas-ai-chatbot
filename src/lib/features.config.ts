/**
 * Domainly AI — Feature Flags
 *
 * Central feature flag config. Toggle features on/off without code changes.
 * Pattern: check `features.someFlag` anywhere in the app.
 *
 * Deployment: These are compile-time flags. To make them runtime-dynamic,
 * move them to environment variables (NEXT_PUBLIC_FEATURE_*).
 */

export const features = {
  /**
   * Demo mode — enables "Try Demo" on the landing page.
   * When true, a demo account can be seeded and accessed without sign-up.
   */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',

  /**
   * Changelog page at /changelog.
   * Toggle to show/hide from nav and enable the route.
   */
  changelog: true,

  /**
   * Command palette (Cmd+K).
   * Shows keyboard shortcut in UI and enables the palette component.
   */
  commandPalette: true,

  /**
   * Status badge on landing page — pings /api/health.
   */
  statusBadge: true,

  /**
   * Email campaigns feature.
   * Disable to hide the Email Marketing section in sidebar.
   */
  emailMarketing: true,

  /**
   * Appointment booking.
   * Disable to remove calendar/booking from the sidebar and chatbot.
   */
  appointments: true,

  /**
   * Product listings in chatbot.
   */
  productListings: true,

  /**
   * Blog/news room on landing page.
   */
  blog: true,
} as const

export type FeatureKey = keyof typeof features
