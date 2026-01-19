import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LeaveBalancesPage from './LeaveBalancesPage';
import adminLeaveService from '../../../services/adminLeaveService';

// Mock the service
vi.mock('../../../services/adminLeaveService');

// Mock the toast hook
vi.mock('../../../core/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock UI components
vi.mock('../../../shared/ui/dialog', () => ({
  Dialog: ({ children, open }) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>
}));

vi.mock('../../../shared/ui/select', () => ({
  Select: ({ children, onValueChange, value }) => (
    <select data-testid="select" onChange={(e) => onValueChange(e.target.value)} value={value}>
      {children}
    </select>
  ),
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>
}));

const mockEmployeesData = [
  {
    employee: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001',
      department: 'IT'
    },
    balances: {
      casual: {
        allocated: 12,
        used: 3,
        remaining: 9,
        pending: 0
      },
      sick: {
        allocated: 10,
        used: 2,
        remaining: 8,
        pending: 1
      }
    }
  }
];

describe('LeaveBalancesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminLeaveService.getAllEmployeesLeaveBalances.mockResolvedValue({
      data: { employees: mockEmployeesData }
    });
  });

  test('renders leave balances page correctly', async () => {
    render(<LeaveBalancesPage />);
    
    expect(screen.getByText('Leave Balance Management')).toBeInTheDocument();
    expect(screen.getByText('Manage employee leave allocations')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('displays employee leave balances', async () => {
    render(<LeaveBalancesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('EMP001 • IT')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument(); // remaining casual leave
      expect(screen.getByText('8')).toBeInTheDocument(); // remaining sick leave
    });
  });

  test('opens assign modal when assign button is clicked', async () => {
    render(<LeaveBalancesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Assign Leave'));
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Assign Leave Balance')).toBeInTheDocument();
  });

  test('filters employees by search term', async () => {
    render(<LeaveBalancesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search by name, employee ID, or department...');
    fireEvent.change(searchInput, { target: { value: 'EMP001' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.getByText('No employees match your search criteria')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    adminLeaveService.getAllEmployeesLeaveBalances.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    
    render(<LeaveBalancesPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});