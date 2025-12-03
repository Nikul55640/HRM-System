# Shadcn/UI Components Usage Guide
**Date:** December 2, 2025  
**Status:** Ready to Use

---

## ✅ What You Have

### MCP Configuration
I've configured the shadcn MCP server in `.kiro/settings/mcp.json`. This allows you to:
- Search for shadcn components
- Get component details
- Add new components easily

### Installed Components (35 components)
You already have these shadcn/ui components installed:

**Form Components:**
- ✅ button
- ✅ input
- ✅ textarea
- ✅ checkbox
- ✅ radio-group
- ✅ select
- ✅ form
- ✅ label

**Layout Components:**
- ✅ card
- ✅ separator
- ✅ sheet
- ✅ tabs
- ✅ scroll-area

**Feedback Components:**
- ✅ alert
- ✅ alert-dialog
- ✅ dialog
- ✅ toast
- ✅ toaster
- ✅ progress
- ✅ skeleton

**Navigation Components:**
- ✅ dropdown-menu
- ✅ navigation-menu
- ✅ menubar

**Data Display:**
- ✅ table
- ✅ badge
- ✅ avatar
- ✅ hover-card
- ✅ tooltip
- ✅ popover
- ✅ calendar

**Custom Modals:**
- ✅ DeleteConfirmModal
- ✅ DepartmentModal
- ✅ LeaveRequestModal
- ✅ RequestDetailModal
- ✅ UserModal

---

## 🚀 How to Use Shadcn Components

### Method 1: Import Existing Components

```javascript
// Import any installed component
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Use in your component
function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button>Submit</Button>
        <Badge>New</Badge>
      </CardContent>
    </Card>
  );
}
```

### Method 2: Add New Components

If you need a component that's not installed:

```bash
# Navigate to frontend directory
cd frontend

# Add a new component (example: accordion)
npx shadcn-ui@latest add accordion

# Add multiple components
npx shadcn-ui@latest add accordion slider switch
```

### Method 3: Use MCP Tools (In Kiro)

Now that MCP is configured, you can ask me to:
- "Search for shadcn button component"
- "Show me shadcn card examples"
- "Add shadcn accordion component"
- "Get details about shadcn dialog"

---

## 📚 Component Examples

### Button Variants
```javascript
import { Button } from '@/components/ui/button';

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card Component
```javascript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog (Modal)
```javascript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content goes here</div>
  </DialogContent>
</Dialog>
```

### Form with Validation
```javascript
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

function MyForm() {
  const form = useForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>Your public username</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Table Component
```javascript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Badge Component
```javascript
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Toast Notifications
```javascript
import { useToast } from '@/components/ui/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Success!",
      description: "Your action was completed.",
    });
  };

  return <Button onClick={showToast}>Show Toast</Button>;
}
```

### Dropdown Menu
```javascript
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🎨 Customization

### Tailwind Configuration
Your shadcn components use Tailwind CSS. The configuration is in:
- `frontend/tailwind.config.js`
- `frontend/src/index.css`

### Theme Colors
You can customize colors in `frontend/src/index.css`:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... more colors */
  }
}
```

### Component Styling
All components support Tailwind classes:
```javascript
<Button className="bg-blue-500 hover:bg-blue-600">
  Custom Styled Button
</Button>
```

---

## 📦 Available Components Not Yet Installed

You can add these if needed:
- accordion
- aspect-ratio
- collapsible
- command
- context-menu
- slider
- switch
- toggle
- toggle-group

To add any:
```bash
cd frontend
npx shadcn-ui@latest add [component-name]
```

---

## 🔧 MCP Commands You Can Use

Now that MCP is configured, you can ask me:

**Search Components:**
- "Search for shadcn button component"
- "Find shadcn form components"
- "Show me shadcn dialog options"

**Get Details:**
- "Get details about shadcn card component"
- "Show me shadcn table documentation"
- "Explain shadcn form component"

**Add Components:**
- "Add shadcn accordion component"
- "Install shadcn slider"
- "Add shadcn switch component"

---

## 💡 Best Practices

### 1. Use Composition
```javascript
// Good: Compose components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Form>...</Form>
  </CardContent>
</Card>
```

### 2. Consistent Styling
```javascript
// Use consistent button variants across your app
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
```

### 3. Accessibility
All shadcn components are accessible by default. Keep it that way:
```javascript
// Good: Proper labels
<FormLabel htmlFor="email">Email</FormLabel>
<Input id="email" type="email" />

// Good: Descriptive buttons
<Button aria-label="Close dialog">×</Button>
```

### 4. Responsive Design
```javascript
// Use Tailwind responsive classes
<Card className="w-full md:w-1/2 lg:w-1/3">
  <CardContent>Responsive card</CardContent>
</Card>
```

---

## 🎯 Quick Reference

### Import Paths
```javascript
// All UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Hooks
import { useToast } from '@/components/ui/use-toast';
```

### Common Patterns
```javascript
// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Destructive action
<Button variant="destructive">
  <Trash className="mr-2 h-4 w-4" />
  Delete
</Button>
```

---

## ✅ Summary

You have:
- ✅ 35+ shadcn components installed
- ✅ MCP server configured for easy access
- ✅ Full Tailwind CSS integration
- ✅ TypeScript support (JSX)
- ✅ Accessible components
- ✅ Customizable themes

You can now:
1. Use any installed component by importing it
2. Ask me to search/add new components via MCP
3. Customize components with Tailwind classes
4. Build consistent, accessible UI

**Ready to use!** 🎉

---

**Documentation Created:** December 2, 2025  
**MCP Status:** Configured & Active  
**Components:** 35+ installed
