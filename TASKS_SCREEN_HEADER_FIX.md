# Tasks Screen Header Fix

## Issue
The back arrow and "Tasks" title were overlapping in the upper left corner of the Tasks screen.

## Root Cause
The back button was positioned absolutely (`absolute left-6 top-4`) with `z-10`, while the title text was using `flex-1` in the same container. This caused the title to start at the left edge and overlap with the back button.

## Solution
Restructured the header layout to use a flexbox approach instead of absolute positioning:

### Before:
```tsx
{/* Back Button - Absolutely positioned */}
{showBackButton && (
  <Pressable className="absolute left-6 top-4 w-10 h-10 items-center justify-center z-10">
    <Ionicons name="arrow-back" size={24} color="#374151" />
  </Pressable>
)}

{/* Title - Started at left edge, causing overlap */}
<View className="flex-row items-center justify-between">
  <Text className="text-xl font-bold text-gray-900 flex-1">
    {title}
  </Text>
  {rightElement}
</View>
```

### After:
```tsx
{/* Title with Back Button - Properly spaced in flexbox */}
<View className="flex-row items-center justify-between">
  {/* Back Button - In normal flow */}
  {showBackButton && (
    <Pressable className="w-10 h-10 items-center justify-center mr-2">
      <Ionicons name="arrow-back" size={24} color="#374151" />
    </Pressable>
  )}
  
  {/* Title - Starts after back button with proper spacing */}
  <Text className="text-xl font-bold text-gray-900 flex-1">
    {title}
  </Text>
  
  {rightElement}
</View>
```

## Key Changes

1. **Removed Absolute Positioning**: The back button is no longer absolutely positioned
2. **Added to Flexbox Flow**: Back button is now part of the same flex row as the title
3. **Added Right Margin**: `mr-2` class adds spacing between the arrow and title
4. **Proper Alignment**: All elements (back arrow, title, right element) are properly aligned in a flex row

## Benefits

- ✅ No more overlapping between arrow and title
- ✅ Consistent spacing across all screens
- ✅ More maintainable layout structure
- ✅ Responsive to different title lengths
- ✅ Works with company banners above

## Files Modified

- `src/components/StandardHeader.tsx` - Updated header layout structure

## Testing

The fix applies to all screens that use `StandardHeader` with `showBackButton={true}`:
- Tasks screen (ProjectsTasksScreen)
- Any other screen that shows a back button

## Visual Result

```
┌─────────────────────────────────────┐
│  ←  Tasks              [+ Button]   │  ← No overlap!
│  🟢 iOS Simulator  🟢 Cloud         │
│  [Refresh] [Logout]                 │
└─────────────────────────────────────┘
```

---

**Date**: October 21, 2025  
**Status**: ✅ Fixed and tested  
**Expo Server**: Running with cleared cache

