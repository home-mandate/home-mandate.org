// Loaded synchronously in <head> (a file, not inline: the CSP has no
// 'unsafe-inline'), so the stored theme applies before the first paint.
import { applyTheme, localStore, readTheme } from './lib/theme.ts';

const root = document.documentElement;
applyTheme(root, readTheme(localStore()));
// Controls that need JavaScript are hidden until this class is present.
root.classList.add('js');
