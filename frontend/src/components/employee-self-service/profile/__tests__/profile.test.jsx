import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersonalInfoForm 
        param($match)
        $importPath = $match.Groups[1].Value
        $targetPath = "frontend/src/$importPath"
        
        # Calculate relative path
        if ($fileDir) {
            $levels = ($fileDir -split '\\').Count
            $prefix = '../' * $levels
        } else {
            $prefix = './'
        }
        
        "from '$prefix$importPath'"
    ;
import ChangeHistoryList 
        param($match)
        $importPath = $match.Groups[1].Value
        $targetPath = "frontend/src/$importPath"
        
        # Calculate relative path
        if ($fileDir) {
            $levels = ($fileDir -split '\\').Count
            $prefix = '../' * $levels
        } else {
            $prefix = './'
        }
        
        "from '$prefix$importPath'"
    ;
import ApprovalStatusBadge 
        param($match)
        $importPath = $match.Groups[1].Value
        $targetPath = "frontend/src/$importPath"
        
        # Calculate relative path
        if ($fileDir) {
            $levels = ($fileDir -split '\\').Count
            $prefix = '../' * $levels
        } else {
            $prefix = './'
        }
        
        "from '$prefix$importPath'"
    ;

// Mock the toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Profile Module Components', () => {
  
  describe('ApprovalStatusBadge', () => {
    it('renders correct badge for approved status', () => {
      render(<ApprovalStatusBadge status="approved" />);
      const badge = screen.getByText('Approved');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100');
    });

    it('renders correct badge for pending status', () => {
      render(<ApprovalStatusBadge status="pending" />);
      const badge = screen.getByText('Pending');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('renders correct badge for rejected status', () => {
      render(<ApprovalStatusBadge status="rejected" />);
      const badge = screen.getByText('Rejected');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-100');
    });
  });

  describe('ChangeHistoryList', () => {
    const mockHistory = [
      {
        id: '1',
        createdAt: '2024-03-20T10:00:00Z',
        field: 'phone',
        oldValue: '1234567890',
        newValue: '0987654321',
        status: 'pending',
        comments: 'Updated phone number'
      },
      {
        id: '2',
        createdAt: '2024-03-19T10:00:00Z',
        changes: [{ field: 'address.city' }],
        oldValue: 'New York',
        newValue: 'London',
        status: 'approved',
        comments: 'Relocation'
      }
    ];

    it('renders empty state when no history', () => {
      render(<ChangeHistoryList history={[]} />);
      expect(screen.getByText('No change history available.')).toBeInTheDocument();
    });

    it('renders history table with data', () => {
      render(<ChangeHistoryList history={mockHistory} />);
      expect(screen.getByText('Change History')).toBeInTheDocument();
      expect(screen.getByText('0987654321')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  describe('PersonalInfoForm', () => {
    const mockProfile = {
      personalInfo: {
        email: 'test@example.com',
        phone: '1234567890',
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '0987654321'
        }
      }
    };

    const mockSubmit = jest.fn();

    it('renders form with profile data', () => {
      render(<PersonalInfoForm profile={mockProfile} onSubmit={mockSubmit} isLoading={false} />);
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test City')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(<PersonalInfoForm profile={{}} onSubmit={mockSubmit} isLoading={false} />);
      
      const submitBtn = screen.getByText('Save Changes');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getAllByText(/Required/i).length).toBeGreaterThan(0);
      });
      
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with form data when valid', async () => {
      render(<PersonalInfoForm profile={mockProfile} onSubmit={mockSubmit} isLoading={false} />);
      
      const submitBtn = screen.getByText('Save Changes');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });
});
