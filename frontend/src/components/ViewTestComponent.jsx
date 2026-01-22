import React, { useState } from 'react';
import { DetailModal } from '../shared/components';
import { Button } from '../shared/ui/button';
import { Eye, User, Building2, Calendar, Mail, Phone, MapPin } from 'lucide-react';

const ViewTestComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [testData, setTestData] = useState(null);

  // Comprehensive test data to verify all field types and features
  const sampleData = {
    // Basic fields
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+91-9876543210',
    website: 'https://johndoe.com',
    
    // Nested object fields
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-05-15',
      gender: 'Male'
    },
    
    jobInfo: {
      designation: 'Senior Developer',
      department: {
        name: 'Engineering',
        code: 'ENG'
      },
      joiningDate: '2020-01-15',
      salary: 1200000,
      employmentType: 'Full-time'
    },
    
    contactInfo: {
      address: '123 Tech Street, Bangalore, Karnataka, India',
      emergencyContact: 'Jane Doe - +91-9876543211'
    },
    
    // Different data types
    employeeId: 'EMP001',
    isActive: true,
    status: 'active',
    priority: 'high',
    workHours: 480, // 8 hours in minutes
    projectCount: 15,
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    
    // Dates
    createdAt: '2020-01-15T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    lastLogin: '2024-01-22T10:15:00Z',
    
    // Long text
    description: 'Experienced software developer with expertise in full-stack development. Proficient in modern web technologies including React, Node.js, and cloud platforms. Strong problem-solving skills and team collaboration experience.',
    
    // Additional test fields
    budget: 5000000,
    completionPercentage: 85.5,
    rating: 4.8,
    
    // Boolean fields
    isManager: false,
    hasAccess: true,
    isVerified: true
  };

  const handleTestView = () => {
    setTestData(sampleData);
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">View Functionality Test</h1>
        <p className="text-gray-600 mb-6">
          This component tests all the enhanced view functionality including nested data access, 
          various field types, and proper data formatting.
        </p>
        
        <Button onClick={handleTestView} className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Test View Modal
        </Button>
      </div>

      {/* Test Modal */}
      {showModal && testData && (
        <DetailModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setTestData(null);
          }}
          title="Comprehensive View Test"
          data={testData}
          sections={[
            {
              label: 'Personal Information',
              fields: [
                { key: 'personalInfo.firstName', label: 'First Name', icon: 'user' },
                { key: 'personalInfo.lastName', label: 'Last Name', icon: 'user' },
                { key: 'email', label: 'Email Address', type: 'email', icon: 'user' },
                { key: 'phone', label: 'Phone Number', type: 'phone', icon: 'user' },
                { key: 'website', label: 'Website', type: 'url', icon: 'user' },
                { key: 'personalInfo.dateOfBirth', label: 'Date of Birth', type: 'date', icon: 'date' },
                { key: 'personalInfo.gender', label: 'Gender', icon: 'user' }
              ]
            },
            {
              label: 'Job Information',
              fields: [
                { key: 'employeeId', label: 'Employee ID', icon: 'description' },
                { key: 'jobInfo.designation', label: 'Designation', icon: 'description' },
                { key: 'jobInfo.department.name', label: 'Department', icon: 'department' },
                { key: 'jobInfo.department.code', label: 'Department Code', icon: 'department' },
                { key: 'jobInfo.joiningDate', label: 'Joining Date', type: 'date', icon: 'date' },
                { key: 'jobInfo.salary', label: 'Annual Salary', type: 'currency' },
                { key: 'jobInfo.employmentType', label: 'Employment Type', icon: 'description' }
              ]
            },
            {
              label: 'Status & Metrics',
              fields: [
                { key: 'isActive', label: 'Active Status', type: 'boolean' },
                { key: 'status', label: 'Current Status', type: 'status' },
                { key: 'priority', label: 'Priority Level', type: 'status' },
                { key: 'projectCount', label: 'Projects Handled', type: 'number', icon: 'user' },
                { key: 'completionPercentage', label: 'Completion Rate', type: 'number', icon: 'user' },
                { key: 'rating', label: 'Performance Rating', type: 'number', icon: 'user' }
              ]
            },
            {
              label: 'Skills & Details',
              fields: [
                { key: 'skills', label: 'Technical Skills', type: 'list', fullWidth: true },
                { key: 'description', label: 'Professional Summary', type: 'longtext', fullWidth: true }
              ]
            },
            {
              label: 'Contact & Location',
              fields: [
                { key: 'contactInfo.address', label: 'Address', type: 'longtext', fullWidth: true, icon: 'location' },
                { key: 'contactInfo.emergencyContact', label: 'Emergency Contact', icon: 'user' }
              ]
            },
            {
              label: 'System Information',
              fields: [
                { key: 'createdAt', label: 'Account Created', type: 'date', icon: 'date' },
                { key: 'updatedAt', label: 'Last Updated', type: 'date', icon: 'date' },
                { key: 'lastLogin', label: 'Last Login', type: 'date', icon: 'date' },
                { key: 'budget', label: 'Allocated Budget', type: 'currency' },
                { key: 'isManager', label: 'Manager Role', type: 'boolean' },
                { key: 'hasAccess', label: 'System Access', type: 'boolean' },
                { key: 'isVerified', label: 'Verified Account', type: 'boolean' }
              ]
            }
          ]}
          actions={[
            {
              label: 'Edit Profile',
              icon: User,
              onClick: () => {
                console.log('Edit action clicked');
                alert('Edit functionality would be triggered here');
              },
              variant: 'default'
            },
            {
              label: 'View Department',
              icon: Building2,
              onClick: () => {
                console.log('Department view clicked');
                alert('Department view would be triggered here');
              },
              variant: 'outline'
            },
            {
              label: 'Close',
              onClick: () => {
                setShowModal(false);
                setTestData(null);
              },
              variant: 'outline'
            }
          ]}
        />
      )}
    </div>
  );
};

export default ViewTestComponent;