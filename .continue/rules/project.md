
---
name: Inventory Project Context
alwaysApply: true
---

# Project Context

This project is a personal inventory application
built with Laravel, MySQL, React Native and Expo.

Read AGENTS.md for detailed project architecture
when file-reading tools are available.

## Instructions
- Follow the existing project architecture.
- Check relevant models, controllers, routes,
  and migrations before implementing features.
- Preserve existing API response formats.
- Use Laravel Sanctum for authentication.
- Avoid unnecessary changes to unrelated files.
- Never assume a database field exists.
- Explain any potentially breaking changes.

## Folder Structure
.
├── .claude/
├── .env
├── .gitignore
├── .vscode/
├── AGENTS.md
├── app.json
├── assets/
│   ├── expo.icon/
│   │   ├── Assets/
│   │   │   └── expo-symbol 2.svg
│   │   └── icon.json
│   ├── images/
│   │   ├── android-icon-background.png
│   │   ├── android-icon-foreground.png
│   │   ├── android-icon-monochrome.png
│   │   ├── expo-badge-white.png
│   │   ├── expo-badge.png
│   │   ├── expo-logo.png
│   │   ├── favicon.png
│   │   ├── icon.png
│   │   ├── logo-glow.png
│   │   ├── react-logo.png
│   │   ├── react-logo@2x.png
│   │   ├── react-logo@3x.png
│   │   ├── splash-icon.png
│   │   └── tabIcons/
│   │       ├── explore.png
│   │       ├── explore@2x.png
│   │       ├── explore@3x.png
│   │       ├── home.png
│   │       ├── home@2x.png
│   │       └── home@3x.png
├── CLAUDE.md
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── axios.ts
│   │   │   ├── borrowings.ts
│   │   │   ├── categories.ts
│   │   │   └── items.tsx
│   │   ├── app/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── explore.tsx
│   │   │   ├── auth/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── register.tsx
│   │   │   ├── app/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── tabs/
│   │   │   │   │   ├── _layout.tsx
│   │   │   │   │   ├── borrowed/
│   │   │   │   │   │   └── index.tsx
│   │   │   │   │   ├── home.tsx
│   │   │   │   │   ├── items/
│   │   │   │   │   │   ├── [id].tsx
│   │   │   │   │   │   └── create.tsx
│   │   │   │   │   └── profile.tsx
│   │   │   │   └── items/
│   │   │   │       └── index.tsx
│   │   │   └── items/
│   │   │       └── [id].tsx
│   │   ├── components/
│   │   │   ├── animated-icon.module.css
│   │   │   ├── animated-icon.tsx
│   │   │   ├── animated-icon.web.tsx
│   │   │   ├── app-tabs.tsx
│   │   │   ├── app-tabs.web.tsx
│   │   │   ├── external-link.tsx
│   │   │   ├── hint-row.tsx
│   │   │   ├── layout/
│   │   │   │   └── CustomTabBar.tsx
│   │   │   ├── themed-text.tsx
│   │   │   ├── themed-view.tsx
│   │   │   └── ui/
│   │   │       └── collapsible.tsx
│   │   ├── constants/
│   │   │   └── theme.ts
│   │   ├── features/
│   │   │   └── categories/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── types.ts
│   │   ├── hooks/
│   │   │   ├── use-color-scheme.ts
│   │   │   ├── use-color-scheme.web.ts
│   │   │   └── use-theme.ts
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx
│   │   ├── screens/
│   │   │   ├── CategoriesScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── types/
│   │   │   └── item.ts
│   │   └── utils/
│   │       └── auth.ts
│   └── README.md
├── LICENSE
├── npm
├── npx
├── package-lock.json
├── package.json
├── README.md
├── scripts/
│   └── reset-project.js
└── src/
    ├── api/
    ├── app/
    ├── components/
    ├── constants/
    ├── features/
    ├── hooks/
    ├── navigation/
    ├── screens/
    ├── types/
    └── utils/
