export const theme = {
  colors: {
    background: '#FAF7F2',
    primary: '#C4788A',
    secondary: '#2D4A3E',
    card: '#FFFFFF',
    text: '#1A1A1A',
    positive: '#D4956A',
    warning: '#D4956A',
    error: '#C4788A',
    border: '#E8E0D8',
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Inter',
  },
  radius: {
    card: '12px',
    button: '8px',
    input: '8px',
  },
  logo: {
    src: '/april-logo.png',
    alt: 'APRil logo',
    width: 40,
  },
  brand: {
    name: 'APRil',
    tagline: 'Know your debt. Own your plan.',
  },
} as const;

export type Theme = typeof theme;
