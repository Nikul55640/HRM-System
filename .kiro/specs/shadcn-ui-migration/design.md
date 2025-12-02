# Design Document: shadcn/ui Migration

## Overview

This design outlines the technical approach for migrating the HRMS frontend application from custom Tailwind CSS components to shadcn/ui components. The migration will be performed incrementally to minimize disruption while improving UI consistency, accessibility, and maintainability.

## Architecture

### Component Migration Strategy

The migration follows a phased approach:

1. **Setup Phase**: Install and configure shadcn/ui infrastructure
2. **Foundation Phase**: Migrate core utility components (Button, Input, Label)
3. **Form Phase**: Migrate all form-related components
4. **Layout Phase**: Migrate layout and navigation components
5. **Data Display Phase**: Migrate tables, cards, and data visualization components
6. **Feedback Phase**: Migrate alerts, toasts, and loading states
7. **Cleanup Phase**: Remove old components and update documentation

### Coexistence Strategy

During migration, both old and new components will coexist:
- New components will be placed in `src/components/ui/` (shadcn/ui convention)
- Old components remain in their current locations
- Pages will be migrated one at a time
- No breaking changes to existing functionality

## Components and Interfaces

### shadcn/ui Components to Install

#### Core Components
- `button` - Replaces custom Button component
- `input` - Replaces custom Input component
- `label` - Replaces custom Label component
- `textarea` - Replaces custom Textarea component
- `select` - Replaces custom Select component
- `checkbox` - Replaces custom Checkbox component
- `radio-group` - Replaces custom Radio component
- `form` - New form wrapper with validation

#### Layout Components
- `card` - Replaces custom Card component
- `separator` - For dividers
- `sheet` - For slide-out panels
- `tabs` - Replaces custom Tabs component

#### Overlay Components
- `dialog` - Replaces custom Modal component
- `alert-dialog` - For confirmation dialogs
- `popover` - For popovers and dropdowns
- `dropdown-menu` - For dropdown menus
- `tooltip` - For tooltips
- `hover-card` - For hover cards

#### Data Display Components
- `table` - Replaces custom Table component
- `badge` - Replaces custom Badge component
- `avatar` - Replaces custom Avatar component
- `skeleton` - For loading states
- `progress` - For progress indicators

#### Feedback Components
- `alert` - Replaces custom Alert component
- `toast` - Integrates with react-toastify or replaces it
- `sonner` - Alternative toast system (optional)

#### Navigation Components
- `navigation-menu` - For main navigation
- `menubar` - For menu bars
- `command` - For command palette (optional)

### Component Mapping

| Old Component | New Component | Location |
|--------------|---------------|----------|
| `components/common/Button.jsx` | `components/ui/button.tsx` | Form actions |
| `components/common/Input.jsx` | `components/ui/input.tsx` | Form fields |
| `components/common/Modal.jsx` | `components/ui/dialog.tsx` | Overlays |
| `components/common/LoadingSpinner.jsx` | `components/ui/skeleton.tsx` | Loading states |
| Custom table components | `components/ui/table.tsx` | Data display |
| Custom card components | `components/ui/card.tsx` | Content containers |

## Data Models

### Theme Configuration

```typescript
// tailwind.config.js theme extension
{
  colors: {
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
    },
    popover: {
      DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
    },
    card: {
      DEFAULT: "hsl(var(--card))",
      foreground: "hsl(var(--card-foreground))",
    },
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
}
```

### CSS Variables

```css
/* app/globals.css or index.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Component API Compatibility
*For any* migrated component, the new shadcn/ui component should accept the same props and maintain the same behavior as the old component
**Validates: Requirements 2.2, 3.2, 4.2, 5.3, 6.2**

### Property 2: Visual Consistency
*For any* page that has been migrated, the visual appearance should match the original design within acceptable tolerance
**Validates: Requirements 9.3, 10.2**

### Property 3: Accessibility Preservation
*For any* interactive component, keyboard navigation and screen reader support should be maintained or improved after migration
**Validates: Requirements 2.3, 3.3, 5.4, 7.2**

### Property 4: Functionality Preservation
*For any* migrated page, all user interactions and workflows should function identically to the pre-migration state
**Validates: Requirements 2.5, 3.2, 9.2, 9.4**

### Property 5: Theme Application
*For any* shadcn/ui component, custom theme colors and styling should be applied consistently
**Validates: Requirements 10.1, 10.2, 10.4**

## Error Handling

### Migration Errors

1. **Component Installation Failures**
   - Retry with verbose logging
   - Check for conflicting dependencies
   - Manually copy component files if CLI fails

2. **Style Conflicts**
   - Use CSS specificity to override when necessary
   - Namespace old components during transition
   - Use `!important` sparingly and document usage

3. **TypeScript Errors**
   - Convert components to TypeScript gradually
   - Use `// @ts-ignore` temporarily with TODO comments
   - Update type definitions as needed

4. **Runtime Errors**
   - Add error boundaries around migrated components
   - Log errors with component context
   - Provide fallback to old components if critical

### Rollback Strategy

Each page migration should be:
- Committed separately in version control
- Feature-flagged if possible
- Easily revertible by restoring old component imports

## Testing Strategy

### Unit Testing

- Test each migrated component in isolation
- Verify prop handling and event callbacks
- Test accessibility features (ARIA attributes, keyboard navigation)
- Test theme application

Example test structure:
```javascript
describe('Button Component (shadcn/ui)', () => {
  it('should render with correct variant styles', () => {
    // Test default, primary, secondary, destructive variants
  });
  
  it('should handle click events', () => {
    // Test onClick callback
  });
  
  it('should be keyboard accessible', () => {
    // Test Enter and Space key handling
  });
  
  it('should apply custom className', () => {
    // Test className merging with cn()
  });
});
```

### Integration Testing

- Test migrated pages end-to-end
- Verify form submissions work correctly
- Test navigation flows
- Verify data loading and display

### Visual Regression Testing

- Take screenshots before migration
- Compare screenshots after migration
- Use tools like Percy, Chromatic, or manual comparison
- Document acceptable differences

### Accessibility Testing

- Run axe-core or similar tools
- Test with keyboard only
- Test with screen readers
- Verify ARIA attributes

## Implementation Notes

### Installation Steps

1. Install shadcn/ui CLI:
```bash
npm install -D @shadcn/ui
```

2. Initialize shadcn/ui:
```bash
npx shadcn-ui@latest init
```

3. Configure components.json:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

4. Install components as needed:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
# etc.
```

### Migration Order

1. **Week 1**: Setup and foundation
   - Install and configure shadcn/ui
   - Migrate Button, Input, Label components
   - Update Login page as proof of concept

2. **Week 2**: Forms
   - Migrate all form components
   - Update employee forms
   - Update admin configuration forms

3. **Week 3**: Layout and Navigation
   - Migrate Card, Tabs components
   - Update Dashboard layout
   - Update Sidebar navigation

4. **Week 4**: Data Display
   - Migrate Table, Badge, Avatar components
   - Update Employee List page
   - Update Directory page

5. **Week 5**: Overlays and Feedback
   - Migrate Dialog, Alert, Toast components
   - Update all modals
   - Update notification system

6. **Week 6**: Cleanup and Documentation
   - Remove old components
   - Update component documentation
   - Final testing and bug fixes

### Code Style Guidelines

- Use TypeScript for new components
- Follow shadcn/ui naming conventions
- Use the `cn()` utility for className merging
- Keep component customization minimal
- Document any deviations from default shadcn/ui components

### Performance Considerations

- shadcn/ui components are tree-shakeable
- Only install components that are actually used
- Monitor bundle size during migration
- Use code splitting for large component libraries

## Migration Checklist

- [ ] shadcn/ui installed and configured
- [ ] Theme colors customized
- [ ] Button component migrated
- [ ] Input component migrated
- [ ] Form components migrated
- [ ] Dialog components migrated
- [ ] Table components migrated
- [ ] Card components migrated
- [ ] Navigation components migrated
- [ ] Alert/Toast components migrated
- [ ] All pages migrated
- [ ] Old components removed
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Visual regression tests passed
