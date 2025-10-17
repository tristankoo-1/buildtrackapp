# Internationalization (i18n) Guide

## Overview

The app now supports **English** and **Traditional Chinese (繁體中文)** with a simple, type-safe translation system. No external i18n libraries needed!

## File Structure

```
src/
├── locales/
│   ├── en.ts           # English translations
│   ├── zh-TW.ts        # Traditional Chinese translations
│   └── index.ts        # Export all translations
├── state/
│   └── languageStore.ts  # Language state management
└── utils/
    └── useTranslation.ts # Translation hook
```

## How to Use Translations

### 1. In Any Screen/Component

```typescript
import { useTranslation } from "../utils/useTranslation";

export default function MyScreen() {
  const t = useTranslation();  // Get translations for current language

  return (
    <View>
      <Text>{t.common.save}</Text>
      <Text>{t.dashboard.welcomeBack}</Text>
      <Text>{t.tasks.createTask}</Text>
    </View>
  );
}
```

### 2. Change Language

```typescript
import { useLanguageStore } from "../state/languageStore";

const { language, setLanguage } = useLanguageStore();

// Change to Chinese
setLanguage("zh-TW");

// Change to English
setLanguage("en");
```

## Translation Structure

All translations are organized by category:

```typescript
const t = useTranslation();

// Common words
t.common.save          // "Save" or "儲存"
t.common.cancel        // "Cancel" or "取消"
t.common.loading       // "Loading..." or "載入中..."

// Authentication
t.auth.login           // "Login" or "登入"
t.auth.logout          // "Logout" or "登出"
t.auth.welcomeBack     // "Welcome Back! 👋" or "歡迎回來！👋"

// Dashboard
t.dashboard.quickOverview   // "Quick Overview" or "快速概覽"
t.dashboard.myTasks         // "My Tasks" or "我的任務"
t.dashboard.allProjects     // "All Projects" or "所有專案"

// Tasks
t.tasks.createTask     // "Create Task" or "建立任務"
t.tasks.priority       // "Priority" or "優先順序"
t.tasks.low            // "Low" or "低"
t.tasks.high           // "High" or "高"

// Profile
t.profile.settings     // "Settings" or "設定"
t.profile.language     // "Language" or "語言"
t.profile.logout       // "Logout" or "登出"

// Common phrases
t.phrases.comingSoon   // "Coming Soon" or "即將推出"
t.phrases.task         // "task" or "任務"
t.phrases.projects     // "projects" or "專案"
```

## Adding New Translations

### Step 1: Add to English (`src/locales/en.ts`)

```typescript
export const en = {
  // ... existing translations
  
  // Add your new section
  myNewFeature: {
    title: "My New Feature",
    description: "This is a description",
    button: "Click Me",
  },
};
```

### Step 2: Add to Chinese (`src/locales/zh-TW.ts`)

```typescript
export const zhTW = {
  // ... existing translations
  
  // Add matching translations
  myNewFeature: {
    title: "我的新功能",
    description: "這是描述",
    button: "點擊我",
  },
};
```

### Step 3: Use in Your Component

```typescript
const t = useTranslation();

<Text>{t.myNewFeature.title}</Text>
<Text>{t.myNewFeature.description}</Text>
<Button title={t.myNewFeature.button} />
```

## Current Translation Coverage

### ✅ Fully Translated
- **ProfileScreen** - All UI elements translated
- **Language Alerts** - Reload prompts, confirmations
- **Common UI Elements** - Buttons, labels, status messages

### 🟡 Partially Translated
- **DashboardScreen** - Structure ready, needs implementation
- **TasksScreen** - Structure ready, needs implementation
- **ProjectsScreen** - Structure ready, needs implementation

### ❌ Not Yet Translated
- **CreateTaskScreen**
- **ReportsScreen**
- **UserManagementScreen**
- **Other admin screens**

## How to Translate Any Screen

### Example: Translating a Button

**Before:**
```typescript
<Button title="Save" />
```

**After:**
```typescript
import { useTranslation } from "../utils/useTranslation";

const t = useTranslation();
<Button title={t.common.save} />
```

### Example: Translating Text

**Before:**
```typescript
<Text>Welcome Back! 👋</Text>
```

**After:**
```typescript
const t = useTranslation();
<Text>{t.dashboard.welcomeBack}</Text>
```

### Example: Translating Alerts

**Before:**
```typescript
Alert.alert("Success", "Task created successfully");
```

**After:**
```typescript
const t = useTranslation();
Alert.alert(
  t.common.success,
  t.tasks.taskCreatedMessage
);
```

## Type Safety

The translation system is fully type-safe! TypeScript will autocomplete and validate all translation keys:

```typescript
const t = useTranslation();

t.dashboard.myTasks  // ✅ Valid - autocomplete works
t.dashboard.invalid  // ❌ TypeScript error
```

## Best Practices

### 1. **Always use the hook at component level**
```typescript
// ✅ Good
function MyComponent() {
  const t = useTranslation();
  return <Text>{t.common.save}</Text>;
}

// ❌ Bad - won't re-render on language change
const t = useTranslation();
function MyComponent() {
  return <Text>{t.common.save}</Text>;
}
```

### 2. **Group related translations**
```typescript
// ✅ Good - organized by feature
t.tasks.createTask
t.tasks.editTask
t.tasks.deleteTask

// ❌ Bad - scattered
t.createTask
t.editTask
t.deleteTask
```

### 3. **Keep translations consistent**
```typescript
// ✅ Good - consistent pattern
t.common.save
t.common.cancel
t.common.delete

// ❌ Bad - inconsistent
t.save
t.actions.cancel
t.buttons.delete
```

### 4. **Use descriptive keys**
```typescript
// ✅ Good
t.tasks.noTasksMessage

// ❌ Bad
t.msg1
```

## Testing Translations

1. Go to **Profile** → **Settings** → **Language**
2. Select **繁體中文**
3. Tap **Reload Now**
4. App reloads with Chinese translations
5. Check translated screens

## Adding More Languages

To add a new language (e.g., Spanish):

### 1. Update language type
```typescript
// src/state/languageStore.ts
export type Language = "en" | "zh-TW" | "es";  // Add "es"
```

### 2. Create translation file
```typescript
// src/locales/es.ts
export const es = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    // ... all other translations
  },
  // ... complete translation structure
};
```

### 3. Register in index
```typescript
// src/locales/index.ts
import { es } from "./es";

export const translations: Record<Language, TranslationKeys> = {
  en: en,
  "zh-TW": zhTW,
  es: es,  // Add Spanish
};
```

### 4. Add to language picker
```typescript
// ProfileScreen.tsx - add new option in modal
<Pressable onPress={() => handleLanguageChange("es")}>
  <Text>Español</Text>
</Pressable>
```

## Quick Reference

| Action | Code |
|--------|------|
| Get current language | `const { language } = useLanguageStore();` |
| Change language | `setLanguage("zh-TW")` |
| Use translations | `const t = useTranslation();` |
| Access translation | `t.common.save` |
| Nested access | `t.dashboard.quickOverview` |

## Support

For any translation questions or to add new translations, edit:
- `/src/locales/en.ts` (English)
- `/src/locales/zh-TW.ts` (Traditional Chinese)

Both files must have **matching structure** for type safety to work!
