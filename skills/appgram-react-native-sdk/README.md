# Appgram React Native SDK skill (skills.sh)

Use this to pull the SDK guidance into Codex/skills.sh.

Install:
- From this repo root: `npx skills add . --skill appgram-react-native-sdk`
- From GitHub: `npx skills add https://github.com/<owner>/<repo> --skill appgram-react-native-sdk`

What’s inside:
- `SKILL.md` instructions for integrating/maintaining `@appgram/react-native`
- `agents/openai.yaml` display metadata
- references for hooks, components, API client, platform setup, and snippets

Peer deps (for app integrators): `@react-native-async-storage/async-storage`, `lucide-react-native`, `react-native-svg`, `react-native-markdown-display`, `react-native-render-html` (run `npx pod-install` on iOS after installing).
