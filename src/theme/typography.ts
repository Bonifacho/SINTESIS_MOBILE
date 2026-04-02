import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.dark,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.gray,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});