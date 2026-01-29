import React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

export const AttendanceAbsent = ({
  employeeName,
  date,
  reason,
  actionUrl
}) => React.createElement(BaseLayout, { title: 'Attendance Alert' },
  React.createElement(Header, { 
    title: 'Attendance Marked as Absent', 
    type: 'error'
  }),
  
  React.createElement(Section, null,
    React.createElement(Text, { style: greeting }, `Hi ${employeeName},`),
    
    React.createElement(Text, { style: mainText },
      `Your attendance for `,
      React.createElement('strong', null, date),
      ` was marked as absent.`
    ),
    
    React.createElement(Section, { style: reasonBox },
      React.createElement(Text, { style: reasonLabel }, 'Reason:'),
      React.createElement(Text, { style: reasonText }, reason)
    ),
    
    React.createElement(Text, { style: mainText },
      'If this is incorrect, please submit a correction request immediately.'
    )
  ),
  
  React.createElement(Footer, {
    actionUrl,
    actionText: 'Submit Correction Request',
    secondaryText: 'Please contact HR if you have any questions about this notification.'
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

const reasonBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const reasonLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 4px 0',
};

const reasonText = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0',
};