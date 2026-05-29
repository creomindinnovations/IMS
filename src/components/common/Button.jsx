export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'danger'
        ? 'inline-flex min-h-[44px] items-center justify-center rounded-btn bg-error px-4 py-2 font-medium text-white hover:bg-red-800 disabled:opacity-50'
        : 'btn-secondary';
  return (
    <button type={type} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
