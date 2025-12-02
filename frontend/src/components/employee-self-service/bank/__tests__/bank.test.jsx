import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BankDetailsView 
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
import BankDetailsForm 
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
import { maskAccountNumber } 
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

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Bank Details Module', () => {
  describe('Helper Functions', () => {
    it('masks account number correctly', () => {
      expect(maskAccountNumber('1234567890')).toBe('****7890');
      expect(maskAccountNumber('123')).toBe('****');
      expect(maskAccountNumber(null)).toBe('****');
    });
  });

  describe('BankDetailsView', () => {
    const mockDetails = {
      accountHolderName: 'John Doe',
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      ifscCode: 'TEST0001234',
      status: 'Approved'
    };

    it('renders details correctly', () => {
      render(<BankDetailsView bankDetails={mockDetails} onEdit={() => {}} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Test Bank')).toBeInTheDocument();
      expect(screen.getByText('****7890')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('renders empty state', () => {
      render(<BankDetailsView bankDetails={null} onEdit={() => {}} />);
      expect(screen.getByText('No bank details found.')).toBeInTheDocument();
    });
  });

  describe('BankDetailsForm', () => {
    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();

    it('validates matching account numbers', async () => {
      render(<BankDetailsForm onSubmit={mockSubmit} onCancel={mockCancel} isLoading={false} />);
      
      fireEvent.change(screen.getByLabelText(/Account Number \*/), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Confirm Account Number/), { target: { value: '87654321' } });
      
      fireEvent.click(screen.getByText('Submit for Approval'));

      await waitFor(() => {
        expect(screen.getByText('Account numbers do not match')).toBeInTheDocument();
      });
    });

    it('submits valid data', async () => {
      render(<BankDetailsForm onSubmit={mockSubmit} onCancel={mockCancel} isLoading={false} />);
      
      fireEvent.change(screen.getByLabelText(/Account Holder Name/), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Bank Name/), { target: { value: 'Test Bank' } });
      fireEvent.change(screen.getByLabelText(/Account Number \*/), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Confirm Account Number/), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/IFSC Code/), { target: { value: 'ABCD0123456' } });
      
      fireEvent.click(screen.getByText('Submit for Approval'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });
});
