/**
 * App color theme
 * Primary: Hot Pink / Red, Deep Rose, Dark Magenta
 * Supporting: Wine, Dark Plum, Near-Black Purple
 * Accent: Coral Pink, Soft Pink, Light Pink
 * Neutral: Off-white / Light Gray
 */

export const Colors = {
  // Primary / Brand
  primary: '#E2274E',       // Hot Pink / Red
  secondary: '#A11848',     // Deep Rose
  primaryDarker: '#621648', // Dark Magenta

  // Supporting dark (UI background / depth)
  wine: '#98103B',
  darkPlum: '#5F0B38',
  background: '#35072B',    // Near-Black Purple (main app background)

  // Accent highlights
  accent: '#F34F6A',        // Coral Pink (fix typo: was acent)
  softPink: '#FA7287',
  lightPink: '#FC93A1',

  // Neutral
  white: '#E7E6E4',         // Off-white / Light Gray (text on dark)
  black: '#E7E6E4',         // Primary text on dark
  gray: '#FA7287',          // Muted (inactive, borders)
  lightgray: '#E7E6E4',

  // Semantic
  green: '#1BE470',         // Success / like
  pink: '#F34F6A',          // Coral Pink

  // Gradients (transparent → brand)
  gradiantsColo1: 'rgba(0,0,0,0)',
  gradiantsColo2: 'rgba(152,16,59,0.9)', // Wine
};

// Backward compatibility: acent → accent (keep both for any legacy imports)
export const LegacyColors = { acent: Colors.accent };
