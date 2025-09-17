# Component Contracts: Email Verification Sync Data Display

**Feature**: `006-in-email-verification`
**Date**: September 17, 2025
**Status**: Contract Definition Complete

## 📋 Component Overview

This document defines the component contracts for the email verification sync data display feature, ensuring consistent interfaces, props, and behavior across all React components.

---

## 🔗 Component Hierarchy

```
EmailVerificationSyncPage
├── EmailVerificationSyncDisplay (Main Container)
    ├── EmailVerificationDataTable (Supabase Data)
    ├── EmailVerificationDataTable (HubSpot Data)
    ├── LoadingState
    └── ErrorDisplay
```

---

## 📝 Component Contracts

### 1. EmailVerificationSyncPage

**File**: `src/pages/EmailVerificationSyncPage.tsx`  
**Purpose**: Main page component for the email verification sync feature

#### Props Interface
```typescript
interface EmailVerificationSyncPageProps {
  // No props - page component
}
```

#### Component Contract
```typescript
interface EmailVerificationSyncPageContract {
  // Rendering
  render(): JSX.Element;

  // Behavior
  onMount(): void;  // Initialize page data
  onUnmount(): void; // Cleanup resources

  // Accessibility
  getPageTitle(): string;  // Return page title for SEO
  getPageDescription(): string; // Return page description
}
```

#### Acceptance Criteria
- [ ] Page renders without errors
- [ ] SEO title and description set correctly
- [ ] Page is accessible via routing
- [ ] Component unmounts cleanly

---

### 2. EmailVerificationSyncDisplay

**File**: `src/components/EmailVerificationSyncDisplay.tsx`  
**Purpose**: Main container component managing data fetching and display logic

#### Props Interface
```typescript
interface EmailVerificationSyncDisplayProps {
  className?: string;  // Additional CSS classes
}
```

#### State Interface
```typescript
interface EmailVerificationSyncDisplayState {
  supabaseData: SupabaseContact[];
  hubspotData: HubSpotContact[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
```

#### Component Contract
```typescript
interface EmailVerificationSyncDisplayContract {
  // Data Management
  fetchData(): Promise<void>;
  refreshData(): Promise<void>;
  handleError(error: Error): void;

  // Rendering
  render(): JSX.Element;
  renderSupabaseSection(): JSX.Element;
  renderHubSpotSection(): JSX.Element;
  renderLoadingState(): JSX.Element;
  renderErrorState(): JSX.Element;

  // User Interactions
  onRefreshClick(): void;
  onRetryClick(): void;

  // Accessibility
  getAriaLabel(): string;
  announceDataUpdate(message: string): void;
}
```

#### Acceptance Criteria
- [ ] Component fetches data on mount
- [ ] Loading and error states display correctly
- [ ] Refresh functionality works
- [ ] Accessibility announcements work
- [ ] Responsive layout maintained

---

### 3. EmailVerificationDataTable

**File**: `src/components/EmailVerificationDataTable.tsx`  
**Purpose**: Reusable data table component for displaying contact data

#### Props Interface
```typescript
interface EmailVerificationDataTableProps {
  data: ContactData[];
  columns: TableColumn[];
  title: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;  // Compact mode for mobile
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface ContactData {
  id: string | number;
  name: string;
  hs_object_id: string;
  email_verification_status: string;
  [key: string]: any; // Additional fields
}
```

#### Component Contract
```typescript
interface EmailVerificationDataTableContract {
  // Data Display
  renderTable(): JSX.Element;
  renderTableHeader(): JSX.Element;
  renderTableBody(): JSX.Element;
  renderTableRow(item: ContactData, index: number): JSX.Element;
  renderTableCell(item: ContactData, column: TableColumn): JSX.Element;

  // Sorting
  handleSort(columnKey: string): void;
  getSortIndicator(columnKey: string): JSX.Element | null;

  // Rendering
  render(): JSX.Element;
  renderEmptyState(): JSX.Element;
  renderLoadingState(): JSX.Element;
  renderErrorState(): JSX.Element;

  // Accessibility
  getTableAriaLabel(): string;
  getRowAriaLabel(item: ContactData): string;
  handleKeyboardNavigation(event: KeyboardEvent): void;
}
```

#### Acceptance Criteria
- [ ] Displays exactly 3 columns: name, hs_object_id, email_verification_status
- [ ] Handles empty data gracefully
- [ ] Loading and error states work
- [ ] Keyboard navigation supported
- [ ] Responsive design implemented
- [ ] Accessibility compliant

---

### 4. LoadingState

**File**: `src/components/LoadingState.tsx`  
**Purpose**: Reusable loading indicator component

#### Props Interface
```typescript
interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'table';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### Component Contract
```typescript
interface LoadingStateContract {
  // Rendering
  render(): JSX.Element;
  renderSpinner(): JSX.Element;
  renderSkeleton(): JSX.Element;
  renderTableSkeleton(): JSX.Element;

  // Accessibility
  getAriaLabel(): string;
  announceLoading(message: string): void;
}
```

#### Acceptance Criteria
- [ ] Displays appropriate loading indicator
- [ ] Screen reader announcements work
- [ ] Customizable size and message
- [ ] Accessible markup

---

### 5. ErrorDisplay

**File**: `src/components/ErrorDisplay.tsx`  
**Purpose**: Reusable error display component

#### Props Interface
```typescript
interface ErrorDisplayProps {
  error: string | Error;
  type?: 'network' | 'data' | 'auth' | 'generic';
  onRetry?: () => void;
  className?: string;
}
```

#### Component Contract
```typescript
interface ErrorDisplayContract {
  // Error Handling
  getErrorMessage(): string;
  getErrorType(): string;
  shouldShowRetry(): boolean;

  // Rendering
  render(): JSX.Element;
  renderErrorIcon(): JSX.Element;
  renderErrorMessage(): JSX.Element;
  renderRetryButton(): JSX.Element;

  // User Interactions
  handleRetryClick(): void;

  // Accessibility
  getAriaLabel(): string;
  announceError(message: string): void;
}
```

#### Acceptance Criteria
- [ ] Displays appropriate error message
- [ ] Retry functionality works when provided
- [ ] Error type determines icon and styling
- [ ] Screen reader announcements work
- [ ] Accessible markup

---

## 🔗 Data Flow Contracts

### Data Fetching Contract
```typescript
interface DataFetchingContract {
  // Supabase Data
  fetchSupabaseContacts(params?: FetchParams): Promise<SupabaseContact[]>;

  // HubSpot Data
  fetchHubSpotContacts(hsObjectIds: string[]): Promise<HubSpotContact[]>;

  // Combined Data
  fetchCombinedData(params?: FetchParams): Promise<CombinedData>;

  // Error Handling
  handleFetchError(error: Error): ErrorDisplayData;
}

interface FetchParams {
  pagination?: PaginationParams;
  filters?: FilterParams;
}

interface CombinedData {
  supabaseRecords: SupabaseContact[];
  hubspotRecords: HubSpotContact[];
  matchedRecords: MatchedContactPair[];
  metadata: DataMetadata;
}
```

### State Management Contract
```typescript
interface StateManagementContract {
  // State Updates
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  setData(data: CombinedData): void;
  updateLastUpdated(timestamp: Date): void;

  // State Selectors
  getLoadingState(): boolean;
  getErrorState(): string | null;
  getDataState(): CombinedData | null;
  getLastUpdated(): Date | null;

  // State Validation
  validateState(): boolean;
  resetState(): void;
}
```

---

## 🎨 Styling Contracts

### CSS Class Contracts
```typescript
interface StylingContracts {
  // Layout Classes
  container: string;        // Main container styling
  dataSection: string;      // Data section wrapper
  tableContainer: string;   // Table wrapper
  loadingContainer: string; // Loading state wrapper
  errorContainer: string;   // Error state wrapper

  // Component Classes
  table: string;           // Table element
  tableHeader: string;     // Table header
  tableBody: string;       // Table body
  tableRow: string;        // Table row
  tableCell: string;       // Table cell

  // State Classes
  loading: string;         // Loading state
  error: string;           // Error state
  empty: string;           // Empty state
  success: string;         // Success state
}
```

### Responsive Design Contracts
```typescript
interface ResponsiveContracts {
  // Breakpoints
  mobile: string;          // Mobile styles (max-width: 640px)
  tablet: string;          // Tablet styles (max-width: 1024px)
  desktop: string;         // Desktop styles (min-width: 1024px)

  // Layout Adjustments
  sideBySide: string;      // Side-by-side layout for desktop
  stacked: string;         // Stacked layout for mobile/tablet
  compactTable: string;    // Compact table for small screens
  fullTable: string;       // Full table for large screens
}
```

---

## ♿ Accessibility Contracts

### ARIA Label Contracts
```typescript
interface AriaLabelContracts {
  // Page Level
  pageTitle: string;
  mainContent: string;

  // Component Level
  supabaseTable: string;
  hubspotTable: string;
  loadingMessage: string;
  errorMessage: string;

  // Interactive Elements
  refreshButton: string;
  retryButton: string;
  sortButton: (column: string) => string;
}
```

### Keyboard Navigation Contracts
```typescript
interface KeyboardNavigationContracts {
  // Navigation Keys
  tabKey: string;          // Tab key for focus navigation
  enterKey: string;        // Enter key for activation
  spaceKey: string;        // Space key for activation
  escapeKey: string;       // Escape key for cancellation

  // Focus Management
  focusFirst: () => void;  // Focus first focusable element
  focusLast: () => void;   // Focus last focusable element
  focusNext: () => void;   // Focus next element
  focusPrevious: () => void; // Focus previous element

  // Trap Management
  trapFocus: (container: HTMLElement) => void;
  releaseFocus: () => void;
}
```

---

## 🧪 Component Testing Contracts

### Unit Test Contracts
```typescript
interface UnitTestContracts {
  // Rendering Tests
  testRendersWithoutErrors: () => void;
  testRendersWithProps: (props: any) => void;
  testRendersLoadingState: () => void;
  testRendersErrorState: () => void;

  // Interaction Tests
  testHandlesUserClick: () => void;
  testHandlesKeyboardEvent: () => void;
  testHandlesDataUpdate: () => void;

  // Accessibility Tests
  testHasProperAriaLabels: () => void;
  testSupportsKeyboardNavigation: () => void;
  testAnnouncesStateChanges: () => void;
}
```

### Integration Test Contracts
```typescript
interface IntegrationTestContracts {
  // Data Flow Tests
  testDataFetching: () => void;
  testDataTransformation: () => void;
  testErrorHandling: () => void;

  // Component Interaction Tests
  testParentChildCommunication: () => void;
  testStateSynchronization: () => void;
  testEventPropagation: () => void;

  // End-to-End Tests
  testCompleteUserWorkflow: () => void;
  testErrorRecovery: () => void;
  testPerformanceRequirements: () => void;
}
```

---

## 📋 Implementation Checklist

### Contract Compliance
- [ ] All components implement defined interfaces
- [ ] Props validation working correctly
- [ ] State management follows contracts
- [ ] Error handling implemented
- [ ] Accessibility requirements met

### Testing Compliance
- [ ] Unit tests cover all contract methods
- [ ] Integration tests validate data flow
- [ ] Accessibility tests pass
- [ ] Performance tests meet requirements
- [ ] Cross-browser compatibility verified

---

*This component contract specification ensures consistent, accessible, and maintainable React components for the email verification sync data display feature.*