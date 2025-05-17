import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        className,
      )}
      {...props}
    />
  );
}
