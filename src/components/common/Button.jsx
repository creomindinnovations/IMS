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
        ? 'inline-flex min-h-[44px] items-center justify-center rounded-btn bg-error px-4 py-2 font-medium text-white transition will-change-transform hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-red-800 hover:shadow-lg disabled:opacity-50'
        : 'btn-secondary';
  return (
    <button type={type} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
