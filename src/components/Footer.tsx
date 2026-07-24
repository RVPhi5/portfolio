import { Github, Linkedin, Mail } from 'lucide-react';

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/RVPhi5',
    icon: Github,
    external: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/rohan-vittal1618',
    icon: Linkedin,
    external: true,
  },
  {
    label: 'Email',
    href: 'mailto:rohan_vittal@brown.edu',
    icon: Mail,
    external: false,
  },
];

/** Site footer: copyright and social icon links. */
export default function Footer() {
  return (
    <footer className="mt-24 flex items-center justify-between border-t border-border py-8 text-[13px] text-muted">
      <span>© 2026 Rohan Vittal</span>
      <nav className="flex items-center gap-4" aria-label="Social links">
        {socials.map(({ label, href, icon: Icon, external }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="text-muted transition-colors duration-150 hover:text-primary"
            {...(external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
          </a>
        ))}
      </nav>
    </footer>
  );
}
