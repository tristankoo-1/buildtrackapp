# 🎨 Dropdown Picker Style Guide

## Rule: Consistent Dropdown Picker Implementation

**When the user requests a "dropdown picker" anywhere in the app, always use the same consistent custom dropdown style.**

## 📋 Standard Implementation Pattern

### 1. State Management
```typescript
const [showXxxPicker, setShowXxxPicker] = useState(false);
```

### 2. Dropdown Trigger
```typescript
<Pressable
  onPress={() => setShowXxxPicker(!showXxxPicker)}
  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex-row items-center justify-between"
>
  <Text className="text-gray-900 text-base">
    {/* Display current selection */}
  </Text>
  <Ionicons 
    name={showXxxPicker ? "chevron-up" : "chevron-down"} 
    size={20} 
    color="#6b7280" 
  />
</Pressable>
```

### 3. Dropdown Options
```typescript
{showXxxPicker && (
  <View className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
    {options.map((option, index) => (
      <Pressable
        key={option.value}
        onPress={() => {
          // Handle selection
          setShowXxxPicker(false);
        }}
        className={cn(
          "px-4 py-3",
          isSelected && "bg-blue-50",
          index < options.length - 1 && "border-b border-gray-200"
        )}
      >
        <Text className={cn(
          "text-base",
          isSelected ? "text-blue-900 font-medium" : "text-gray-900"
        )}>
          {option.label}
        </Text>
      </Pressable>
    ))}
  </View>
)}
```

## 🎨 Design Specifications

### Visual Style
- **Border**: `border border-gray-300`
- **Background**: `bg-gray-50` (trigger), `bg-white` (dropdown)
- **Padding**: `px-4 py-3`
- **Border Radius**: `rounded-lg`
- **Shadow**: `shadow-lg` (dropdown only)

### Interactive States
- **Selected Item**: `bg-blue-50` background, `text-blue-900 font-medium` text
- **Unselected Item**: `text-gray-900` text
- **Hover**: Use `active:` classes for touch feedback

### Icons
- **Closed State**: `chevron-down` icon
- **Open State**: `chevron-up` icon
- **Icon Size**: `20`
- **Icon Color**: `#6b7280`

### Spacing
- **Dropdown Gap**: `mt-1` between trigger and dropdown
- **Item Spacing**: `px-4 py-3` for each option
- **Item Separators**: `border-b border-gray-200` between items

## 🔧 Technical Requirements

### Z-Index
- **Dropdown**: `z-50` to appear above other content

### Positioning
- **Dropdown**: `absolute top-full left-0 right-0` to position below trigger

### State Management
- **Boolean State**: `showXxxPicker` for open/closed state
- **Close on Selection**: Always call `setShowXxxPicker(false)` when option is selected

## 📱 Examples

### Status Picker
```typescript
const statusOptions = ["planning", "active", "on_hold", "completed", "cancelled"];
```

### Lead PM Picker
```typescript
const leadPMOptions = [
  { value: "", label: "No Lead PM (Select one)" },
  ...users.map(user => ({ 
    value: user.id, 
    label: `${user.name} (${user.role})` 
  }))
];
```

### Priority Picker
```typescript
const priorityOptions = ["low", "medium", "high", "urgent"];
```

## ✅ Checklist

When implementing a dropdown picker, ensure:

- [ ] Uses custom Pressable components (not native Picker)
- [ ] Has chevron up/down icons
- [ ] Shows selected item highlighted in blue
- [ ] Proper z-index layering
- [ ] Consistent padding and borders
- [ ] Smooth open/close interactions
- [ ] Proper state management
- [ ] Follows the standard implementation pattern

## 🎯 Goal

**Consistent, modern dropdown interface across the entire BuildTrack application.**

---

*This style guide ensures UI consistency and provides a better user experience throughout the app.*
