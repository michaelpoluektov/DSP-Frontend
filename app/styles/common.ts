import { theme } from './theme'

export const commonStyles = {
  container: {
    primary: `${theme.colors.primary} ${theme.spacing.md} ${theme.rounded} ${theme.shadow}`,
    secondary: `${theme.colors.secondary} ${theme.spacing.md} ${theme.rounded} ${theme.shadow}`,
    tertiary: `${theme.colors.tertiary} ${theme.spacing.md} ${theme.rounded} ${theme.shadow}`
  },
  text: {
    heading: `${theme.fonts.heading} ${theme.colors.text.primary}`,
    title: `${theme.fonts.title} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow}`,
    subtitle: `${theme.fonts.subtitle} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow}`,
    body: `${theme.fonts.body} ${theme.colors.text.primary}`,
    secondary: `${theme.colors.text.secondary}`,
    tertiary: `${theme.colors.text.tertiary}`
  },
  button: {
    primary: `${theme.colors.button.primary} ${theme.rounded} ${theme.spacing.sm} ${theme.shadow} ${theme.borderWidth} ${theme.colors.border}`,
    secondary: `${theme.colors.button.secondary} ${theme.rounded} ${theme.spacing.sm} ${theme.shadow} ${theme.borderWidth} ${theme.colors.border}`,
    icon: `${theme.colors.button.secondary} ${theme.rounded} ${theme.spacing.sm} ${theme.shadow}`
  },
  input: {
    base: `${theme.colors.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded}`,
    focus: 'focus:outline-none focus:ring-2 focus:ring-[#00B6B0]/30 focus:border-[#00B6B0]'
  }
} 