# Components cheat sheet

Use inside `AppgramProvider`. All components are stylable via theme exports or props where noted.

## Feedback / Wishes
- `WishList`: full list + filters; props `title?`, `description?`, `filters?`, `showSubmitButton?`, `submitButtonText?`, callbacks `onWishPress`, `onWishSubmitted`, `onVote`, `onCommentPress`, `refreshInterval?`.
- `WishCard`: single wish card; props `wish`, `onPress`, `onVote`, `onCommentPress`.
- `VoteButton`: standalone vote UI; props `wishId`, `initialVoteCount`, `initialHasVoted`, `onVoteChange`.
- `WishDetailModal`: modal detail w/ comments & votes; props `wishId`, `visible`, `onClose`, `onVote`, `onComment`.
- `SubmitWishSheet`: sheet to create wish; props `visible`, `onClose`, `onSuccess`, `title?`, `description?`.

## Roadmap
- `RoadmapBoard`: Kanban-style columns; props `onItemPress?`, `refreshInterval?`.

## Releases / Changelog
- `Releases`: combined list + detail navigation; `onReleasePress?`.
- `ReleaseList`: list view; props `limit?`, `onReleasePress`.
- `ReleaseDetail`: single release; props `releaseSlug`, `onBack?`.

## Help Center
- `HelpCenter`: flows + articles overview; props `title?`, `onFlowPress`, `onArticlePress`.
- `HelpFlowCard`: summary card; props `flow`, `onPress`.
- `HelpFlowDetail`: flow detail; props `slug`, `onArticlePress`, `onBack?`.
- `HelpArticleCard`: article preview; props `article`, `onPress`.
- `HelpArticleDetail`: article content; props `slug`, `flowId?`, `onBack?`.

## Support & Forms
- `SupportForm`: ticket form; props `title?`, `userEmail?`, `userName?`, `onSuccess`, `onError?`.
- `FormRenderer`: render dynamic form by `formId`; props `formId`, `onSuccess?`, `onError?`.

## Surveys
- `SurveyForm`: interactive survey; props `slug`, `onSuccess`, `onError?`.

## Blog
- `Blog`: full blog view; props `title?`, `onPostPress`.
- `BlogList`: list with pagination/filter; props `category?`, `onPostPress`.
- `BlogCard`: card; props `post`, `onPress`.
- `BlogPostDetail`: article content; props `slug`, `onBack?`.

## Status
- `StatusBoard`: status + incidents; props `slug`, `refreshInterval?`.

## Chat
- `ChatScreen`: chat UI; uses `ChatSource` type; expects messages from Appgram client or custom source.

## Base UI
- `Button`, `Card`, `Badge`, `Input`: Hazel-themed primitives; accept standard RN text/input props plus style overrides.
