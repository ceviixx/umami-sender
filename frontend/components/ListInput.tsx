import React, { useState } from 'react';

interface EmailListInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const EmailListInput: React.FC<EmailListInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addEmail = (email: string) => {
    const trimmed = email.trim();
    if (trimmed && isValidEmail(trimmed) && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['Enter', ' ', ','].includes(e.key)) {
    e.preventDefault();
    addEmail(inputValue);
    setInputValue('');
  }

  if (e.key === 'Backspace' && inputValue === '' && value.length) {
    e.preventDefault();
    removeEmail(value[value.length - 1]);
  }
};


  const removeEmail = (email: string) => {
    onChange(value.filter((e) => e !== email));
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          {label}
        </label>
      )}
      <div
        className="flex flex-wrap items-center gap-2 border rounded px-3 py-2 bg-white text-lg "
        >
        {value.map((email) => (
          <span
            key={email}
            className="flex items-center bg-gray-100 text-primary-800 text-sm px-2 rounded-full"
          >
            {email}
            <button
              type="button"
              onClick={() => removeEmail(email)}
              className="ml-1 text-gray-500 hover:text-red-500"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-[100px] border-none focus:ring-0 focus:outline-none text-sm"
        />
      </div>
    </div>
  );
};

export default EmailListInput;
