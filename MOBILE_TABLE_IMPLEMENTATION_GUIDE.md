# Mobile-Responsive Table Implementation Guide

## Quick Reference for Converting Tables to Mobile-Friendly Views

---

## Pattern 1: Card View for Mobile (Recommended)

### Before (Desktop Only):
```jsx
<div className="overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.email}</TableCell>
          <TableCell>{item.status}</TableCell>
          <TableCell>
            <Button>Edit</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### After (Responsive with Mobile Cards):
```jsx
{/* Mobile Card View */}
<div className="block sm:hidden space-y-3">
  {items.map(item => (
    <Card key={item.id} className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <Badge>{item.status}</Badge>
        </div>
        <div className="text-sm text-gray-600">{item.email}</div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1">Edit</Button>
          <Button size="sm" variant="outline" className="flex-1">Delete</Button>
        </div>
      </div>
    </Card>
  ))}
</div>

{/* Desktop Table View */}
<div className="hidden sm:block overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.email}</TableCell>
          <TableCell><Badge>{item.status}</Badge></TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button size="sm">Edit</Button>
              <Button size="sm" variant="outline">Delete</Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## Pattern 2: Reusable Mobile Card Component

### Create a Reusable Component:
```jsx
// components/MobileItemCard.jsx
import { Card } from '../shared/ui/card';
import { Badge } from '../shared/ui/badge';
import { Button } from '../shared/ui/button';

const MobileItemCard = ({ item, onEdit, onDelete, statusBadge }) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {item.name || item.title}
            </h3>
            {item.subtitle && (
              <p className="text-sm text-gray-600 truncate">{item.subtitle}</p>
            )}
          </div>
          {statusBadge && (
            <Badge className="ml-2 flex-shrink-0">{statusBadge}</Badge>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1 text-sm">
          {Object.entries(item.details || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key}:</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            {onEdit && (
              <Button size="sm" onClick={() => onEdit(item)} className="flex-1">
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDelete(item)}
                className="flex-1"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MobileItemCard;
```

### Usage:
```jsx
import MobileItemCard from './components/MobileItemCard';

// In your component:
<div className="block sm:hidden space-y-3">
  {items.map(item => (
    <MobileItemCard
      key={item.id}
      item={{
        name: item.name,
        subtitle: item.email,
        details: {
          'Department': item.department,
          'Role': item.role,
          'Status': item.status
        }
      }}
      statusBadge={item.status}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ))}
</div>
```

---

## Pattern 3: Responsive Table with Hidden Columns

### For tables that work on mobile with fewer columns:
```jsx
<div className="overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead className="hidden md:table-cell">Email</TableHead>
        <TableHead className="hidden lg:table-cell">Department</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-20">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>
            <div>
              <div className="font-medium">{item.name}</div>
              {/* Show email on mobile as subtitle */}
              <div className="text-sm text-gray-600 md:hidden">{item.email}</div>
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell">{item.email}</TableCell>
          <TableCell className="hidden lg:table-cell">{item.department}</TableCell>
          <TableCell><Badge>{item.status}</Badge></TableCell>
          <TableCell>
            <Button size="sm">Edit</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## Pattern 4: Using Existing ResponsiveTable Component

### If you have a responsive-table.jsx component:
```jsx
import { ResponsiveTable } from '../shared/ui/responsive-table';

<ResponsiveTable
  data={items}
  columns={[
    { key: 'name', label: 'Name', mobile: true },
    { key: 'email', label: 'Email', mobile: false },
    { key: 'status', label: 'Status', mobile: true },
  ]}
  renderMobileCard={(item) => (
    <Card className="p-4">
      <h3>{item.name}</h3>
      <p>{item.email}</p>
      <Badge>{item.status}</Badge>
    </Card>
  )}
  renderActions={(item) => (
    <Button onClick={() => handleEdit(item)}>Edit</Button>
  )}
/>
```

---

## Files That Need This Pattern

### High Priority:
1. **ManageAttendance.jsx** (modules/attendance/admin/)
   - Complex table with many columns
   - Use Pattern 1 (Card View)

2. **EmployeeTable.jsx** (modules/employees/components/)
   - Employee listing
   - Use Pattern 2 (Reusable Card Component)

3. **PolicyTable.jsx** (modules/organization/components/)
   - Policy management
   - Use Pattern 1 (Card View)

4. **DepartmentTable.jsx** (modules/organization/components/)
   - Department listing
   - Use Pattern 3 (Hidden Columns) - simpler table

5. **DesignationTable.jsx** (modules/organization/components/)
   - Designation listing
   - Use Pattern 3 (Hidden Columns) - simpler table

6. **HolidayTable.jsx** (modules/organization/components/)
   - Holiday listing
   - Use Pattern 1 (Card View)

---

## Tailwind Breakpoints Reference

```css
/* Mobile First Approach */
sm:  /* >= 640px  - Small tablets */
md:  /* >= 768px  - Tablets */
lg:  /* >= 1024px - Laptops */
xl:  /* >= 1280px - Desktops */
2xl: /* >= 1536px - Large desktops */
```

### Common Responsive Patterns:
```jsx
// Show on mobile only
className="block sm:hidden"

// Hide on mobile
className="hidden sm:block"

// Responsive grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Responsive spacing
className="p-3 sm:p-4 lg:p-6"

// Responsive text
className="text-sm sm:text-base lg:text-lg"

// Responsive width
className="w-full sm:w-auto"
```

---

## Testing Checklist

After implementing mobile views:

- [ ] Test on 320px width (iPhone SE)
- [ ] Test on 375px width (iPhone 12/13)
- [ ] Test on 390px width (iPhone 14 Pro)
- [ ] Test on 768px width (iPad)
- [ ] Test on 1024px width (iPad Pro)
- [ ] Test on 1920px width (Desktop)

### Specific Checks:
- [ ] All content is readable without horizontal scroll
- [ ] Buttons are easily tappable (min 44x44px)
- [ ] Text doesn't overflow containers
- [ ] Images scale properly
- [ ] Forms are easy to fill on mobile
- [ ] Actions are accessible on mobile

---

## Performance Tips

1. **Use CSS over JavaScript**
   ```jsx
   // ❌ Bad: JavaScript width check
   {window.innerWidth < 640 ? <MobileView /> : <DesktopView />}
   
   // ✅ Good: CSS classes
   <div className="block sm:hidden"><MobileView /></div>
   <div className="hidden sm:block"><DesktopView /></div>
   ```

2. **Avoid Duplicate Rendering**
   - Use CSS to hide/show instead of conditional rendering when possible
   - Reduces React re-renders

3. **Lazy Load Mobile Components**
   ```jsx
   const MobileView = lazy(() => import('./MobileView'));
   ```

---

## Common Pitfalls to Avoid

1. **Fixed Widths**
   ```jsx
   // ❌ Bad
   className="w-[500px]"
   
   // ✅ Good
   className="w-full sm:w-auto sm:max-w-md"
   ```

2. **Missing Overflow Handling**
   ```jsx
   // ❌ Bad
   <div><Table>...</Table></div>
   
   // ✅ Good
   <div className="overflow-x-auto"><Table>...</Table></div>
   ```

3. **Tiny Touch Targets**
   ```jsx
   // ❌ Bad
   <button className="p-1">X</button>
   
   // ✅ Good
   <button className="p-2 min-w-[44px] min-h-[44px]">X</button>
   ```

4. **Ignoring Landscape Mode**
   - Test both portrait and landscape orientations
   - Especially important for tablets

---

## Example: Complete Implementation for ManageAttendance.jsx

```jsx
// ManageAttendance.jsx - Mobile Responsive Version

import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../shared/ui/table';
import { Edit, Trash2, Clock } from 'lucide-react';

const ManageAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Attendance</h1>
        <Button className="w-full sm:w-auto">Add Record</Button>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {attendanceRecords.map(record => (
          <Card key={record.id} className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {record.employeeName}
                  </h3>
                  <p className="text-sm text-gray-600">{record.date}</p>
                </div>
                <Badge className={getStatusColor(record.status)}>
                  {record.status}
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Clock In:</span>
                  <div className="font-medium">{record.clockIn || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Clock Out:</span>
                  <div className="font-medium">{record.clockOut || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Working Hours:</span>
                  <div className="font-medium">{record.workingHours || 'N/A'}</div>
                </div>
                {record.lateMinutes > 0 && (
                  <div>
                    <span className="text-gray-600">Late:</span>
                    <div className="font-medium text-orange-600">
                      {record.lateMinutes} min
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(record)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(record)}
                  className="flex-1 text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Employee</TableHead>
              <TableHead className="min-w-[100px]">Date</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[80px]">Clock In</TableHead>
              <TableHead className="min-w-[80px]">Clock Out</TableHead>
              <TableHead className="min-w-[80px]">Late Minutes</TableHead>
              <TableHead className="min-w-[100px]">Working Hours</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map(record => (
              <TableRow key={record.id}>
                <TableCell>{record.employeeName}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>{record.clockIn || 'N/A'}</TableCell>
                <TableCell>{record.clockOut || 'N/A'}</TableCell>
                <TableCell>
                  {record.lateMinutes > 0 ? (
                    <span className="text-orange-600">{record.lateMinutes}</span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{record.workingHours || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(record)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'present': return 'bg-green-100 text-green-800';
    case 'absent': return 'bg-red-100 text-red-800';
    case 'late': return 'bg-orange-100 text-orange-800';
    case 'half_day': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default ManageAttendance;
```

---

## Quick Start Checklist

For each table component:

1. [ ] Identify the table component file
2. [ ] Choose appropriate pattern (1-4)
3. [ ] Create mobile card layout
4. [ ] Add responsive classes (block sm:hidden / hidden sm:block)
5. [ ] Test on multiple screen sizes
6. [ ] Verify touch targets are large enough
7. [ ] Check text readability
8. [ ] Ensure actions are accessible
9. [ ] Test with real data
10. [ ] Get user feedback

---

**Remember:** Mobile-first design means starting with the mobile view and enhancing for larger screens, not the other way around!
