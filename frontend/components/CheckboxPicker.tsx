import { useState } from 'react';

type Option = {
  value: string;   // or number, depends on your use case
  label: string;
};

type CheckboxPickerProps = {
  options: Option[];
  selectedOptions: string[];  // should match the type of Option.value
  onChange: (arg: { name: string; value: string[] }) => void;
  name: string;
};

const CheckboxPicker = ({
  options,
  selectedOptions,
  onChange,
  name,
}: CheckboxPickerProps) => {
  const handleToggle = (value: string) => {
    const updatedSelectedOptions = selectedOptions.includes(value)
      ? selectedOptions.filter((option) => option !== value)
      : [...selectedOptions, value];
    onChange({ name, value: updatedSelectedOptions });
  };

  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => {
        const isSelected = selectedOptions.includes(option.value)
        return (
          <div
            key={option.value}
            className={`flex items-center cursor-pointer border rounded-lg p-3 transition-colors
              ${isSelected
                ? 'bg-white dark:bg-gray-900 text-blue-500 border-gray-300 dark:border-gray-600'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            onClick={() => handleToggle(option.value)}
          >
            <div
              className={`w-5 h-5 border-2 rounded-full transition-colors
                ${isSelected
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-500'
                }`}
            ></div>
            <span className="ml-2">{option.label}</span>
          </div>
        )
      })}
    </div>
  );
};

export default CheckboxPicker;
