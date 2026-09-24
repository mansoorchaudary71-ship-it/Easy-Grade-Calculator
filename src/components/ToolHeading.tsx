import React from 'react';

interface ToolHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
}

export const ToolHeading: React.FC<ToolHeadingProps> = ({ eyebrow, title, copy }) => {
  return (
    <section className="tool-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="tool-title">{title}</h1>
      <p>{copy}</p>
    </section>
  );
};
