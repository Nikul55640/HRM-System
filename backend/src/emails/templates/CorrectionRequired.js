import React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

export const CorrectionRequired = ({
  employeeName,
  date,
  issue,
  actionUrl
}) => React.createElement(BaseLayout, { title: 'Attendance Correction Required' },
  React.createElement(Header, { 
    title: 'Attendance Correction Required', 
    type: 'warning'
  }),
  
  React.createElement(Section, null,
    React.createElement(Text, { style: greeting }, `Hi ${employeeName},`),
    
    React.createElement(Text, { style: mainText },
      `Your attendance for `,
      React.createElement('strong', null, date),
      ` requires correction.`
    ),
    
    React.createElement(Section, { style: issueBox },
      React.createElement(Text, { style: issueLabel }, 'Issue:'),
      React.createElement(Text, { style: issueText }, issue)
    ),
    
    React.createElement(Text, { style: mainText },
      'Please submit a correction request to resolve this issue.'
    )
  ),
  
  React.createElement(Footer, {
    actionUrl,
    actionText: 'Submit Correction Request',
    secondaryText: 'You can provide the correct clock-in/clock-out times in the correction form.'
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

const issueBox = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fed7aa',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const issueLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#d97706',
  margin: '0 0 4px 0',
};

const issueText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
};