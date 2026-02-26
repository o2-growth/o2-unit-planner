import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', className, disabled }: CurrencyInputProps) {
  const [display, setDisplay] = useState(value ? formatCurrencyInput(value) : '');
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplay(raw);
    onChange(parseCurrencyInput(raw));
  }, [onChange]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseCurrencyInput(display);
    setDisplay(parsed ? formatCurrencyInput(parsed) : '');
  }, [display]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    if (value) setDisplay(value.toString().replace('.', ','));
  }, [value]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
      <Input
        type="text"
        value={focused ? display : (value ? formatCurrencyInput(value) : '')}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`pl-10 ${className || ''}`}
        disabled={disabled}
      />
    </div>
  );
}
