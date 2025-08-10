import React from 'react';
import SelectBox from '@/components/SelectBox';

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: String(i).padStart(2, '0'),
    label: String(i).padStart(2, '0'),
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: String(i).padStart(2, '0'),
    label: String(i).padStart(2, '0'),
  }));

  const [hour, minute] = value.split(':');

  const handleHourChange = (newHour: string | null) => {
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string | null) => {
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div className="w-1/4">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <SelectBox
          label=""
          value={hour}
          onChange={handleHourChange}
          options={hours}
          hasCheckbox={false}
        />
        <span className="text-xl">:</span>
        <SelectBox
          label=""
          value={minute}
          onChange={handleMinuteChange}
          options={minutes}
          hasCheckbox={false}
        />
      </div>
    </div>
  );
};

export default TimePicker;
