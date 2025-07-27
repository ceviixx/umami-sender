import { useState } from 'react';

const CheckboxPicker = ({ options, selectedOptions, onChange, name }) => {
  const handleToggle = (value) => {
    const updatedSelectedOptions = selectedOptions.includes(value)
      ? selectedOptions.filter((option) => option !== value)
      : [...selectedOptions, value];
    onChange({ name, value: updatedSelectedOptions });
  };

  return (
    <div className="flex flex-wrap gap-4">
        {options.map((option) => (
            <div
            key={option.value}
            className={`flex items-center cursor-pointer border rounded-lg p-3 ${
                selectedOptions.includes(option.value)
                ? 'bg-white text-blue-500 border-gray-300'
                : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
            }`}
            onClick={() => handleToggle(option.value)}
            >
            <div
                className={`w-5 h-5 border-2 rounded-full ${
                selectedOptions.includes(option.value) ? 'bg-blue-500' : 'bg-white'
                }`}
            ></div>
            <span className="ml-2">{option.label}</span>
            </div>
        ))}
        </div>
  );
};

export default CheckboxPicker;
