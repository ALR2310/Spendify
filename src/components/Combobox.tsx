import { ChangeEvent, useEffect, useRef, useState } from 'react';

const classSizes = {
  xs: { input: 'select-xs', option: 'menu-xs' },
  sm: { input: 'select-sm', option: 'menu-sm' },
  md: { input: 'select-md', option: 'menu-md' },
  lg: { input: 'select-lg', option: 'menu-lg' },
  xl: { input: 'select-xl', option: 'menu-xl' },
};

interface Option {
  label: string;
  value: string;
}

interface classNames {
  container?: string;
  input?: string;
  option?: string;
}

interface ComboboxProps {
  className?: string;
  classNames?: classNames;
  size?: keyof typeof classSizes;
  value?: string;
  options?: Option[];
  placeholder?: string;
  floatingLabel?: boolean;
  onChange?: (value: Option['value']) => void;
  onInputChange?: (value: string) => void;
  render?: (option: Option) => React.ReactNode;
}

export default function Combobox({
  className = '',
  classNames,
  size = 'md',
  value,
  options = [],
  placeholder,
  floatingLabel,
  onChange,
  onInputChange,
  render,
}: ComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const [inputValue, setInputValue] = useState('');
  const [lastBlurValue, setLastBlurValue] = useState<string | undefined>();

  useEffect(() => {
    if (value !== undefined) {
      const matchedOption = options.find((option) => option.value === value);
      setInputValue(matchedOption ? matchedOption.label : '');
      setLastBlurValue(undefined);
    }
  }, [value, options]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);
  };

  const handleOptionSelect = (option: Option) => {
    setInputValue(option.label);
    onChange?.(option.value);
    containerRef.current.classList.add('dropdown-close');
    setTimeout(() => {
      containerRef.current.classList.remove('dropdown-close');
    }, 100);
  };

  const handleInputBlur = () => {
    const matchedOption = options.find((option) => option.label === inputValue);
    if (matchedOption && matchedOption.value !== value && matchedOption.value !== lastBlurValue) {
      setLastBlurValue(matchedOption.value);
      onChange?.(matchedOption.value);
    }
  };

  const filteredOptions = options.filter((option) => {
    const q = inputValue.toLowerCase();
    return option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q);
  });

  const inputElement = (
    <input
      type="search"
      className={`select ${className} ${classSizes[size as keyof typeof classSizes].input} ${classNames?.input}`}
      value={inputValue}
      placeholder={placeholder}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
    />
  );

  return (
    <div ref={containerRef} className={`dropdown ${classNames?.container}`}>
      {floatingLabel ? (
        <label className="floating-label">
          <span>{placeholder}</span>
          {inputElement}
        </label>
      ) : (
        inputElement
      )}

      <ul
        tabIndex={-1}
        className={`dropdown-content flex-nowrap menu max-h-60 overflow-y-auto bg-base-100 border border-base-content/10 no-scrollbar rounded-box z-10 p-2 shadow-sm mt-2 w-full ${classSizes[size as keyof typeof classSizes].option} ${classNames?.option}`}
      >
        {filteredOptions.length === 0 && (
          <li>
            <span>No items found</span>
          </li>
        )}
        {filteredOptions.map((option) => (
          <li key={option.value} className="w-full" onClick={() => handleOptionSelect(option)}>
            {render ? render(option) : <span className="line-clamp-1">{option.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
