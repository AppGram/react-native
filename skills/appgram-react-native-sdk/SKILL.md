---
name: appgram-react-native-sdk
description: "Integrate or maintain the Appgram React Native SDK (@appgram/react-native): install peers, configure AppgramProvider, use built-in components/hooks for feedback, roadmap, releases, help center, support, surveys, blog, status, chat, apply theming, and run build/lint/docs tasks."
---

# Appgram React Native SDK

## When to use
- You need to embed Appgram feedback/roadmap/changelog/help/support/surveys/blog/status/chat in a React Native app.
- You are wiring Appgram headless hooks into custom UI.
- You are maintaining this SDK: build, lint, docs, publish, or debugging peer/native issues.

## Prerequisites
- React Native ≥0.70, React 18, Metro; iOS requires CocoaPods, Android uses autolinking.
- Peer deps: `@react-native-async-storage/async-storage`, `lucide-react-native`, `react-native-svg`, `react-native-markdown-display`, `react-native-render-html`.
- Install peers after the SDK, then `npx pod-install` for iOS.

## Quick start
- Install: `npm install @appgram/react-native` then peer deps `npm install @react-native-async-storage/async-storage lucide-react-native react-native-svg react-native-markdown-display react-native-render-html`.
- iOS: run `npx pod-install` after installing peers.
- Wrap your app once:
```tsx
<AppgramProvider config={{ projectId: 'YOUR_PROJECT_ID', orgSlug: 'org', projectSlug: 'project', apiUrl: 'https://api.appgram.dev', theme: { mode: 'system' } }}>
  {children}
</AppgramProvider>
```
- Use ready UI or headless hooks:
```tsx
<WishList onWishPress={(wish) => console.log(wish)} />
<SupportForm onSuccess={() => Alert.alert('Sent')} />
// Hooks
const { wishes, isLoading, refetch } = useWishes()
const { vote } = useVote()
```

## Feature map (components → hooks)
- Feedback: `WishList`, `WishCard`, `VoteButton`, `WishDetailModal`, `SubmitWishSheet` → `useWishes`, `useVote`, `useComments`.
- Roadmap: `RoadmapBoard` → `useRoadmap`.
- Releases/Changelog: `Releases`, `ReleaseList`, `ReleaseDetail` → `useReleases`, `useRelease`.
- Help Center: `HelpCenter`, `HelpFlowCard`, `HelpFlowDetail`, `HelpArticleCard`, `HelpArticleDetail` → `useHelpCenter`, `useHelpFlow`, `useHelpArticle`.
- Support & Forms: `SupportForm`, `FormRenderer` → `useSupport`, `useForm`, `useFormSubmit`.
- Surveys: `SurveyForm` → `useSurvey`, `useSurveySubmit`.
- Blog: `Blog`, `BlogList`, `BlogCard`, `BlogPostDetail` → `useBlogPosts`, `useBlogPost`, `useBlogCategories`, `useFeaturedPosts`.
- Status: `StatusBoard` → `useStatus`.
- Chat: `ChatScreen` (`ChatSource` type available) – pull data via context client as needed.
- Base UI bits: `Button`, `Card`, `Badge`, `Input` for consistent styling.

**Hook pattern:** hooks return data + `isLoading` (and often `error`, `refetch`); many accept `refreshInterval` and filter props (see exported option/result types).

### Props & options details
- Hooks: see `references/hooks.md` (options, return shapes, behaviors like refreshInterval and fingerprinting).
- Components: see `references/components.md` (purpose + key props per component).

## Configuration & theming
- `AppgramProvider.config`:
  - `projectId` (required), `orgSlug`/`projectSlug` for routing.
  - `apiUrl` override for self-host/staging (default `https://api.appgram.dev`).
  - `enableFingerprinting` (default true) uses AsyncStorage + device info for anonymous votes.
  - `theme`: `mode` (`light`|`dark`|`system`), optional `lightColors`/`darkColors` partial overrides; defaults from Hazel design system.
- Access context: `useAppgramContext()` → `{ client, config, fingerprint, theme }`.
- Theming in custom UI: `useAppgramTheme()` → `{ colors, spacing, radius, typography, isDark, mode }`; palette exports `lightColors`, `darkColors`, scales `spacing`, `radius`, `typography` for reuse.

### Sample themed usage
```tsx
const { colors, spacing, radius } = useAppgramTheme()
return (
  <Card style={{ backgroundColor: colors.background, padding: spacing.lg, borderRadius: radius.lg }}>
    <WishList submitButtonText=\"Suggest a feature\" />
  </Card>
)
```

## API client
- Get the instantiated `AppgramClient` from context: `const { client } = useAppgramContext()`.
- Methods mirror hooks (e.g., `client.getWishes`, `client.vote`, `client.getRoadmap`); responses follow `ApiResponse` / `PaginatedResponse` types exported from `types`.
- Use when you need imperative flows (e.g., prefetch before navigation) or custom caching.

## Local development & maintenance (this repo)
- Install dev deps: `npm install`.
- Lint: `npm run lint`; typecheck: `npm run typecheck`.
- Build package: `npm run build` (builder-bob, outputs to `lib/`); runs automatically on `npm install` via `prepare`.
- Docs: `npm run docs:json` (typedoc) → `docs.json`; `npm run docs:transform` (uses `transform-docs.js`); `npm run docs:build` to do both.
- Publish (when ready): `npm run release` (assumes npm auth + version bump). Keep `react-native-builder-bob` config in `package.json`; build uses `tsconfig.build.json`.

## Platform setup & debugging
- Install order, pod install, Gradle check, cache clears, and platform notes: `references/platform-setup.md`.

## Common recipes
- **Custom vote button:** use `useVote`; pass `onVote` to sync local counts; guard for missing fingerprint by showing a prompt to enable cookies/storage.
- **Support with magic link:** use `useSupport`; call `requestMagicLink(email)` then `verifyToken(token)`; tickets also saved locally (`storedTickets`, `clearStoredTickets`).
- **Embed changelog tab:** stack navigator screen with `Releases`; on press, navigate to detail screen wrapping `ReleaseDetail`.
- **Anonymous wishlist:** keep `enableFingerprinting` on (default); if privacy requires, set false and disable voting UI.
- **Blog index + detail:** `BlogList` for landing; use `useBlogPosts` if you need infinite scroll; route to `BlogPostDetail` on press.
- **Status page banner:** call `useStatus({ slug, refreshInterval: 60000 })` and render a small inline banner with `data.status`.
- See ready-to-paste code in `references/snippets.md`.

## Troubleshooting
- Missing peer deps / native linking: ensure all peers installed; run `npx pod-install` for iOS; clear Metro cache if symbols missing.
- Theming not applying: verify `theme.mode` not overridden by system; pass both light/dark overrides when customizing primary/background/foreground.
- Anonymous voting blocked: set `enableFingerprinting=false` if fingerprint cannot be generated, or ensure AsyncStorage works in environment.
- API errors: confirm `projectId`/slugs and `apiUrl`; use `client` methods to inspect `response.success` and `response.error`.
- Version support: built for React Native ≥0.70 and React 18+. Ensure `react-native-svg` and `lucide-react-native` versions stay compatible.

## References (load on demand)
- Hooks options/returns: `references/hooks.md`
- Components props notes: `references/components.md`
- API client methods + notes: `references/api-client.md`
- Platform setup & debugging: `references/platform-setup.md`
- Practical code snippets: `references/snippets.md`
