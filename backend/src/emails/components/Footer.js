import React from 'react';
import { Section, Text, Button } from '@react-email/components';

export const Footer = ({ actionUrl, actionText, secondaryText }) => 
  React.createElement(Section, { style: footerSection },
    actionUrl && actionText && React.createElement(Section, { style: buttonSection },
      React.createElement(Button, { style: button, href: actionUrl }, actionText)
    ),
    
    secondaryText && React.createElement(Text, { style: secondaryTextStyle }, secondaryText),
    
    React.createElement(Text, { style: signatureText },
      'Thank you,',
      React.createElement('br'),
      'HRM System Team'
    )
  );

const footerSection = {
  marginTop: '32px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '24px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 24px',
  lineHeight: '24px',
};

const secondaryTextStyle = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '20px',
  margin: '16px 0',
};

const signatureText = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '24px',
  margin: '24px 0 0 0',
};