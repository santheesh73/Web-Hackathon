'use client';

import * as React from 'react';
import { Sun, Moon, Check, Circle } from 'lucide-react';
import { useTheme, type Theme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'red',
    label: 'Crimson Red',
    icon: (
      <span className="inline-flex items-center justify-center h-4 w-4" aria-hidden="true">
        <Circle className="h-3.5 w-3.5 fill-red-500 text-red-500" />
      </span>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <Moon className="h-4 w-4 text-red-400" aria-hidden="true" />,
  },
  {
    value: 'light',
    label: 'Light',
    icon: <Sun className="h-4 w-4 text-rose-500" aria-hidden="true" />,
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = THEME_OPTIONS.findIndex((opt) => opt.value === theme);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % THEME_OPTIONS.length);
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < THEME_OPTIONS.length) {
          setTheme(THEME_OPTIONS[focusedIndex].value);
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Get active icon for trigger button
  const currentOption = THEME_OPTIONS.find((opt) => opt.value === theme) || THEME_OPTIONS[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-foreground transition-colors',
          'hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          isOpen && 'bg-surface-muted ring-2 ring-ring/30'
        )}
        aria-label={`Change theme. Current theme: ${currentOption.label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentOption.icon}
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Select color theme"
          className={cn(
            'absolute right-0 top-full mt-1.5 w-40 rounded-xl border border-border bg-surface p-1.5 shadow-lg z-50',
            'focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100'
          )}
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
            Theme Mode
          </div>
          {THEME_OPTIONS.map((option, idx) => {
            const isSelected = theme === option.value;
            const isFocused = focusedIndex === idx;

            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={cn(
                  'flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-surface-muted',
                  isFocused && !isSelected && 'bg-surface-muted',
                  'focus-visible:outline-none focus-visible:bg-surface-muted'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
