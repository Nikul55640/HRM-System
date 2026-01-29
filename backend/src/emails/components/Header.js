import React from 'react';
import { Section, Text } from '@react-email/components';

export const Header = ({ title, subtitle, type = 'info' }) => {
  const typeColors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const color = typeColors[type] || typeColors.info;
  const icon = typeIcons[type] || typeIcons.info;

  return React.createElement(Section, { style: headerSection },
    React.createElement(Text, { style: { ...headerTitle, color } },
      React.createElement('span', { style: iconStyle }, icon),
      title
    ),
    subtitle && React.createElement(Text, { style: headerSubtitle }, subtitle)
  );
};

const headerSection = {
  marginBottom: '24px',
};

const headerTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '32px',
};

const headerSubtitle = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '24px',
};

const iconStyle = {
  marginRight: '8px',
};