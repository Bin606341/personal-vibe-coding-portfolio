type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export const SectionHeader = ({ eyebrow, title, description }: SectionHeaderProps) => (
  <section className="section-header">
    <span className="eyebrow">{eyebrow}</span>
    <h1>{title}</h1>
    <p>{description}</p>
  </section>
);

