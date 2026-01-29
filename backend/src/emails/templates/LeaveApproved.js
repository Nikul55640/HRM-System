import React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

export const LeaveApproved = ({
  employeeName,
  leaveType,
  startDate,
  endDate,
  days,
  approverName,
  actionUrl
}) => React.createElement(BaseLayout, { title: 'Leave Request Approved' },
  React.createElement(Header, { 
    title: 'Leave Request Approved', 
    type: 'success'
  }),
  
  React.createElement(Section, null,
    React.createElement(Text, { style: greeting }, `Hi ${employeeName},`),
    
    React.createElement(Text, { style: mainText },
      'Great news! Your leave request has been approved.'
    ),
    
    React.createElement(Section, { style: detailsBox },
      React.createElement(Text, { style: detailsTitle }, 'Leave Details:'),
      
      React.createElement(Section, { style: detailRow },
        React.createElement(Text, { style: detailLabel }, 'Leave Type:'),
        React.createElement(Text, { style: detailValue }, leaveType)
      ),
      
      React.createElement(Section, { style: detailRow },
        React.createElement(Text, { style: detailLabel }, 'Start Date:'),
        React.createElement(Text, { style: detailValue }, startDate)
      ),
      
      React.createElement(Section, { style: detailRow },
        React.createElement(Text, { style: detailLabel }, 'End Date:'),
        React.createElement(Text, { style: detailValue }, endDate)
      ),
      
      React.createElement(Section, { style: detailRow },
        React.createElement(Text, { style: detailLabel }, 'Duration:'),
        React.createElement(Text, { style: detailValue }, `${days} day(s)`)
      ),
      
      React.createElement(Section, { style: detailRow },
        React.createElement(Text, { style: detailLabel }, 'Approved By:'),
        React.createElement(Text, { style: detailValue }, approverName)
      )
    ),
    
    React.createElement(Text, { style: mainText },
      'You can view your leave details in the system.'
    )
  ),
  
  React.createElement(Footer, {
    actionUrl,
    actionText: 'View My Leaves',
    secondaryText: 'Enjoy your time off!'
  })
);

const greeting = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
  color: '#374151',
};

const mainText = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
  color: '#374151',
};

const detailsBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const detailsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0 0 12px 0',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '8px 0',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0',
  width: '40%',
};

const detailValue = {
  fontSize: '14px',
  color: '#14532d',
  margin: '0',
  width: '60%',
};