# Implementation Plan: shadcn/ui Migration

- [x] 1. Setup shadcn/ui infrastructure




  - Install shadcn/ui CLI and dependencies
  - Initialize shadcn/ui configuration
  - Configure Tailwind CSS with theme variables
  - Set up CSS variables in global styles
  - Create utils directory with cn() function
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Install and configure core form components


  - Install Button, Input, Label, Textarea components
  - Install Select, Checkbox, Radio Group components
  - Install Form component for validation
  - Test components in isolation
  - _Requirements: 2.1_

- [x] 3. Migrate Login page as proof of concept



  - Replace Button components with shadcn/ui Button
  - Replace Input components with shadcn/ui Input
  - Replace Label components with shadcn/ui Label
  - Verify form submission works
  - Test accessibility with keyboard navigation
  - _Requirements: 2.2, 2.3, 2.5_

- [x] 4. Install overlay and dialog components

  - Install Dialog, AlertDialog, Sheet components
  - Install Popover, DropdownMenu, Tooltip components
  - Test components in isolation
  - _Requirements: 3.1, 7.1_

- [x] 5. Migrate modal components


  - Replace DepartmentModal with shadcn/ui Dialog
  - Replace other admin modals with shadcn/ui Dialog
  - Verify focus trapping and escape key handling
  - Test modal stacking if applicable
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 6. Install data display components


  - Install Table, Card, Badge, Avatar components
  - Install Skeleton and Progress components
  - Test components in isolation
  - _Requirements: 4.1, 6.1_

- [x] 7. Migrate Dashboard page


  - Replace Card components with shadcn/ui Card
  - Replace Badge components with shadcn/ui Badge
  - Replace Avatar components with shadcn/ui Avatar
  - Replace LoadingSpinner with Skeleton
  - Verify all dashboard widgets display correctly
  - _Requirements: 4.3, 4.4, 4.5_


- [ ] 8. Migrate Employee List page
  - Replace table components with shadcn/ui Table
  - Replace status badges with shadcn/ui Badge
  - Replace avatar components with shadcn/ui Avatar
  - Verify sorting and filtering work
  - Test pagination if applicable

  - _Requirements: 4.2, 4.4, 4.5_

- [ ] 9. Install navigation components
  - Install NavigationMenu, Tabs components
  - Install Menubar component if needed

  - Test components in isolation
  - _Requirements: 5.1_

- [ ] 10. Migrate Sidebar navigation
  - Replace navigation items with shadcn/ui components
  - Replace dropdown menus with shadcn/ui DropdownMenu

  - Verify keyboard navigation works
  - Test active state highlighting
  - _Requirements: 5.2, 5.3, 5.5_

- [x] 11. Migrate tab-based interfaces

  - Replace Tabs in admin configuration pages
  - Verify tab switching maintains state
  - Test ARIA attributes
  - _Requirements: 5.4_


- [ ] 12. Install feedback components
  - Install Alert and Toast components
  - Install Sonner (optional alternative to react-toastify)
  - Test components in isolation
  - _Requirements: 6.1_


- [ ] 13. Migrate alert and error displays
  - Replace error alerts with shadcn/ui Alert
  - Replace success messages with shadcn/ui Alert
  - Verify dismissible alerts work correctly
  - _Requirements: 6.2, 6.5_


- [ ] 14. Migrate toast notifications
  - Replace react-toastify with shadcn/ui Toast or Sonner
  - Update all toast.success(), toast.error() calls
  - Verify toast positioning and animations

  - Test toast dismissal
  - _Requirements: 6.3, 6.5_

- [ ] 15. Migrate loading states
  - Replace LoadingSpinner with Skeleton components
  - Add Progress components where appropriate
  - Verify loading states display correctly

  - _Requirements: 6.4_

- [ ] 16. Migrate Employee Form page
  - Replace all form inputs with shadcn/ui components
  - Replace Select dropdowns with shadcn/ui Select

  - Replace Checkbox/Radio with shadcn/ui components
  - Verify form validation works with Formik
  - Test form submission
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 17. Migrate Profile Editor page

  - Replace form components with shadcn/ui equivalents
  - Verify read-only fields display correctly
  - Test form submission and validation
  - _Requirements: 2.2, 2.5_

- [x] 18. Migrate Document Upload page

  - Replace upload button with shadcn/ui Button
  - Replace file list with shadcn/ui Table or Card
  - Verify drag-and-drop still works
  - Test file upload progress display
  - _Requirements: 4.3, 6.4_


- [ ] 19. Migrate User Management page
  - Replace table with shadcn/ui Table
  - Replace action buttons with shadcn/ui Button
  - Replace role badges with shadcn/ui Badge
  - Verify user CRUD operations work
  - _Requirements: 4.2, 4.4_


- [ ] 20. Migrate System Config page
  - Replace tab navigation with shadcn/ui Tabs
  - Replace form components in config sections
  - Replace cards with shadcn/ui Card
  - Verify all configuration updates work

  - _Requirements: 5.4, 4.3_

- [ ] 21. Migrate Employee Directory page
  - Replace search input with shadcn/ui Input
  - Replace employee cards with shadcn/ui Card

  - Replace avatars with shadcn/ui Avatar
  - Verify search and filtering work
  - _Requirements: 4.3, 4.5_

- [ ] 22. Add tooltips to action buttons
  - Install Tooltip component if not already done


  - Add tooltips to icon buttons throughout app
  - Verify tooltip positioning
  - Test tooltip delays
  - _Requirements: 7.2, 7.4_

- [ ] 23. Add hover cards for user info
  - Install HoverCard component if not already done
  - Add hover cards to user mentions/avatars
  - Verify hover delay and positioning
  - _Requirements: 7.3, 7.4_

- [ ] 24. Customize theme colors
  - Update CSS variables to match HRMS brand colors
  - Test light mode color scheme
  - Add dark mode support (optional)
  - Verify all components use theme colors
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 25. Customize border radius and typography
  - Update --radius CSS variable
  - Configure font families in Tailwind config
  - Verify consistent styling across components
  - _Requirements: 10.4, 10.5_

- [x] 26. Create migration documentation

  - Document component mapping (old → new)
  - Provide before/after code examples
  - List breaking changes and API differences
  - Create troubleshooting guide
  - _Requirements: 8.1, 8.2, 8.3, 8.5_


- [x] 27. Document migration steps

  - Create step-by-step migration guide
  - Document common patterns and best practices
  - Add examples for complex migrations
  - _Requirements: 8.4_

- [ ] 28. Remove old custom components
  - Delete unused Button component
  - Delete unused Input component
  - Delete unused Modal component
  - Delete unused LoadingSpinner component
  - Delete other unused custom components
  - _Requirements: 9.5_

- [ ] 29. Update component imports throughout app
  - Search and replace old component imports
  - Verify no broken imports remain
  - Update index files if needed
  - _Requirements: 9.5_

- [ ] 30. Final testing and verification
  - Run all unit tests
  - Run integration tests
  - Perform visual regression testing
  - Test accessibility with screen readers
  - Verify all pages function correctly
  - _Requirements: 9.4_

- [ ] 31. Performance audit
  - Check bundle size before/after migration
  - Verify no performance regressions
  - Optimize imports if needed
  - _Requirements: 9.2_

- [ ] 32. Update project documentation
  - Update README with shadcn/ui information
  - Update component documentation
  - Add shadcn/ui to tech stack documentation
  - Document theme customization process
  - _Requirements: 8.1_
