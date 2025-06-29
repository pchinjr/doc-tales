// Safe Design Testing Components - DO NOT IMPORT INTO MAIN APP
// This file is for testing DuckTales aesthetic concepts

import React from 'react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';

// Test theme configuration
const duckTalesTheme = {
  colors: {
    primary: '#2c5aa0',
    secondary: '#ffd700',
    accent: '#ff6b35',
    danger: '#dc143c'
  },
  animations: {
    bounce: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    wiggle: 'transform 0.2s ease-in-out'
  }
};

// Test Button Component
export const DuckTalesButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Button
    sx={{
      borderRadius: '15px',
      fontWeight: 'bold',
      textTransform: 'none',
      background: duckTalesTheme.colors.secondary,
      color: duckTalesTheme.colors.primary,
      border: `2px solid ${duckTalesTheme.colors.primary}`,
      transition: duckTalesTheme.animations.bounce,
      '&:hover': {
        transform: 'scale(1.05) rotate(1deg)',
        background: duckTalesTheme.colors.accent,
        color: 'white'
      }
    }}
  >
    {children}
  </Button>
);

// Test Card Component
export const DuckTalesCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card
    sx={{
      borderRadius: '20px',
      border: `3px solid ${duckTalesTheme.colors.primary}`,
      boxShadow: `0 8px 16px rgba(44, 90, 160, 0.2)`,
      transition: duckTalesTheme.animations.bounce,
      '&:hover': {
        transform: 'scale(1.02) rotate(0.5deg)'
      }
    }}
  >
    <CardContent>
      <Typography
        variant="h6"
        sx={{
          color: duckTalesTheme.colors.primary,
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '2px 2px 0px white, 2px 2px 4px rgba(0,0,0,0.3)',
          marginBottom: 2
        }}
      >
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

// Test Layout Component
export const DuckTalesDashboard: React.FC = () => (
  <Box
    sx={{
      background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)',
      minHeight: '100vh',
      padding: 3
    }}
  >
    <Box
      sx={{
        maxWidth: 1200,
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: 4,
        border: `3px solid ${duckTalesTheme.colors.primary}`
      }}
    >
      <Typography
        variant="h2"
        sx={{
          textAlign: 'center',
          color: duckTalesTheme.colors.primary,
          fontWeight: 'bold',
          textShadow: '3px 3px 0px white, 3px 3px 6px rgba(0,0,0,0.3)',
          marginBottom: 4
        }}
      >
        Doc-Tales
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        <DuckTalesCard title="📧 Communications">
          <Typography>Recent emails and messages with sentiment analysis</Typography>
        </DuckTalesCard>
        
        <DuckTalesCard title="📊 Analytics">
          <Typography>Data visualization with treasure map styling</Typography>
        </DuckTalesCard>
        
        <DuckTalesCard title="🎯 Priorities">
          <Typography>Adventure quest-style task management</Typography>
        </DuckTalesCard>
      </Box>
      
      <Box sx={{ textAlign: 'center', marginTop: 4 }}>
        <DuckTalesButton>Try the Adventure!</DuckTalesButton>
      </Box>
    </Box>
  </Box>
);

// CSS-in-JS styles for testing
export const duckTalesStyles = {
  // Bouncy animations
  '@keyframes bounce': {
    '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
    '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
    '70%': { transform: 'translate3d(0, -15px, 0)' },
    '90%': { transform: 'translate3d(0, -4px, 0)' }
  },
  
  // Speech bubble styles
  speechBubble: {
    position: 'relative',
    background: 'white',
    border: `3px solid ${duckTalesTheme.colors.primary}`,
    borderRadius: '20px',
    padding: '15px',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-10px',
      left: '20px',
      border: '10px solid transparent',
      borderTopColor: duckTalesTheme.colors.primary
    }
  }
};
