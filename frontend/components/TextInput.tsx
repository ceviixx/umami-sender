interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function TextInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  ...rest
}: TextInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`relative w-full cursor-default rounded-md border py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base
      ${disabled
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
            : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700'
          }`}
        {...rest}
      />
    </div>

  )
}