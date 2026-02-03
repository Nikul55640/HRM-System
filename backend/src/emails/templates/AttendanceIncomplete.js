import React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

export const AttendanceIncomplete = ({
  employeeName,
  date,
  issue,
  actionUrl
}) => React.createElement(BaseLayout, { title: 'Attendance Notice' },
  React.createElement(Header, { 
    title: 'Attendance Notice', 
    type: 'info'
  }),
  
  React.createElement(Section, null,
    React.createElement(Text, { style: greeting }, `Hi ${employeeName},`),
    
    React.createElement(Text, { style: mainText },
      `We noticed your attendance for `,
      React.createElement('strong', null, date),
      ` is incomplete.`
    ),
    
    React.createElement(Section, { style: noticeBox },
      React.createElement(Text, { style: noticeLabel }, 'Details:'),
      React.createElement(Text, { style: noticeText }, issue)
    ),
    
    React.createElement(Text, { style: mainText },
      'No action is required if this is correct. However, if you need to update your attendance record, you can submit a correction request through the attendance portal.'
    ),
    
    React.createElement(Text, { style: helpText },
      'If you have any questions or need assistance, please contact your HR team.'
    )
  ),
  
  React.createElement(Footer, {
    actionUrl,
    actionText: 'Submit Correction Request (Optional)',
    secondaryText: 'You can provide the correct clock-in/clock-out times if needed.'
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

const noticeBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const noticeLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#0369a1',
  margin: '0 0 4px 0',
};

const noticeText = {
  fontSize: '14px',
  color: '#075985',
  margin: '0',
};

const helpText = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0 0 0',
  color: '#6b7280',
  fontStyle: 'italic',
};