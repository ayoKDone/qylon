import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  variant?: 'default' | 'bold' | 'light';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'block transition-colors duration-200';

  const variantStyles = {
    default: 'font-medium text-gray-700',
    bold: 'font-bold text-gray-900',
    light: 'font-normal text-gray-600',
  };

  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <label
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabledStyles}
        ${className}
      `}
      {...props}
    >
      {children}
      {required && <span className='text-red-500 ml-1'>*</span>}
    </label>
  );
};

export default Label;
