import type { ReactNode } from 'react';

interface RuleHeadingProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  small?: boolean;
  id?: string;
}

/** Uppercase title followed by a thin rule, as used on every page of the PDF portfolio. */
export function RuleHeading({ children, as: Tag = 'h2', small, id }: RuleHeadingProps) {
  return (
    <Tag id={id} className={small ? 'rule-heading rule-heading--small' : 'rule-heading'}>
      {children}
    </Tag>
  );
}
