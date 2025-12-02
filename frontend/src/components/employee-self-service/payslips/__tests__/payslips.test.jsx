import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PayslipList from '../../../../features/ess/payslips/PayslipList';
import PayslipDetail from '../../../../features/ess/payslips/PayslipDetail';
// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Payslips Module', () => {
  const mockPayslips = [
    {
      id: '1',
      month: 'March',
      year: 2024,
      netSalary: 50000,
      generatedAt: '2024-03-31T10:00:00Z',
      earnings: { basic: 30000, hra: 15000, allowances: 10000 },
      deductions: { pf: 3000, tax: 2000 },
      totalEarnings: 55000,
      totalDeductions: 5000
    }
  ];

  describe('PayslipList', () => {
    it('renders list of payslips', () => {
      render(<PayslipList payslips={mockPayslips} onView={() => {}} onDownload={() => {}} />);
      expect(screen.getByText('March')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00')).toBeInTheDocument(); // Assuming USD format default
    });

    it('renders empty state', () => {
      render(<PayslipList payslips={[]} onView={() => {}} onDownload={() => {}} />);
      expect(screen.getByText('No payslips available.')).toBeInTheDocument();
    });

    it('calls action handlers', () => {
      const onView = jest.fn();
      const onDownload = jest.fn();
      render(<PayslipList payslips={mockPayslips} onView={onView} onDownload={onDownload} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // View
      expect(onView).toHaveBeenCalledWith(mockPayslips[0]);
      
      fireEvent.click(buttons[1]); // Download
      expect(onDownload).toHaveBeenCalledWith(mockPayslips[0]);
    });
  });

  describe('PayslipDetail', () => {
    it('renders detail modal content', () => {
      render(<PayslipDetail payslip={mockPayslips[0]} open={true} onClose={() => {}} />);
      expect(screen.getByText('Payslip Details - March 2024')).toBeInTheDocument();
      expect(screen.getByText('Basic Salary')).toBeInTheDocument();
      expect(screen.getByText('$30,000.00')).toBeInTheDocument();
      expect(screen.getByText('Net Salary')).toBeInTheDocument();
    });

    it('does not render when closed or no payslip', () => {
      const { container } = render(<PayslipDetail payslip={null} open={true} onClose={() => {}} />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
