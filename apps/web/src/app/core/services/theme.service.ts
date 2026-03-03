import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'twstock-theme';
const DARK_CLASS = 'dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.loadPreference());

  constructor() {
    effect(() => {
      this.applyClass(this.isDark());
    });
  }

  toggle(): void {
    this.isDark.update((v) => !v);
    localStorage.setItem(STORAGE_KEY, this.isDark() ? 'dark' : 'light');
  }

  private loadPreference(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    const dark = stored === 'dark';
    // 初始化時同步 class（effect 尚未執行）
    if (typeof document !== 'undefined') {
      this.applyClass(dark);
    }
    return dark;
  }

  private applyClass(dark: boolean): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle(DARK_CLASS, dark);
    }
  }
}
