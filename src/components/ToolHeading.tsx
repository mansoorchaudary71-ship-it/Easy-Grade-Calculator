import React from 'react';

interface ToolHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
}

export const ToolHeading: React.FC<ToolHeadingProps> = ({ eyebrow, title, copy }) => {
  return (
    <section className="tool-heading">
      <div className="eyebrow">{eyebrow}</div>
      <div className="tool-title">{title}</div>
      <p>{copy}</p>
    </section>
  );
};
