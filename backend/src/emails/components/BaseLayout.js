import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';

export const BaseLayout = ({ children, title = 'HRM System' }) => (
  React.createElement(Html, null,
    React.createElement(Head, null,
      React.createElement('title', null, title)
    ),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Section, { style: header },
          React.createElement(Text, { style: headerText }, 'HRM System')
        ),
        
        React.createElement(Section, { style: content }, children),
        
        React.createElement(Hr, { style: hr }),
        
        React.createElement(Section, { style: footer },
          React.createElement(Text, { style: footerText },
            'This is an automated message from HRM System.'
          ),
          React.createElement(Text, { style: footerText },
            `© ${new Date().getFullYear()} HRM System. All rights reserved.`
          )
        )
      )
    )
  )
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 30px',
  backgroundColor: '#2563eb',
  borderRadius: '8px 8px 0 0',
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '0',
};

const content = {
  padding: '30px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 30px',
  textAlign: 'center',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};