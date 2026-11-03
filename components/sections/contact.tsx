import { getSection, sectionLabel, site } from "@/content/site";
import { Magnetic } from "@/components/motion";
import { ContactEmail } from "@/components/contact/contact-email";
import { TerminalHint } from "@/components/contact/terminal-hint";
import { NewTabMark } from "@/components/shared/new-tab-mark";

const section = getSection("contact");

const link =
  "label-meta -mx-2 inline-flex h-11 items-center gap-1.5 px-2 transition-colors duration-(--dur-instant) hover:text-fg";

/**
 * 06 / CONTACT and the page footer: the email headline (click copies,
 * hover scrambles), socials + resume, back to top, and the colophon.
 */
export function Contact() {
  const { profile, socials, footer } = site;
  const links = [...socials, { label: "Resume", href: profile.resume.href }];

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="border-t border-line pt-(--space-section) pb-8 lg:pb-10"
    >
      <div className="container-site flex flex-col gap-10">
        <h2 id="contact-title" className="label-meta text-fg-muted">
          {sectionLabel(section)}
        </h2>

        <div className="flex flex-col gap-4 border-b border-line pb-10 lg:pb-12">
          <ContactEmail />
          <p className="label-meta text-fg-muted">
            <span className="pointer-coarse:hidden">click to copy</span>
            <span className="hidden pointer-coarse:inline">tap to copy</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-fg-muted">
            {links.map((item) => (
              <li key={item.label}>
                <Magnetic>
                  <a href={item.href} target="_blank" rel="noopener" data-cursor="open" className={link}>
                    {item.label} <NewTabMark />
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
          <Magnetic>
            <a href="#index" className={`${link} text-fg-muted`}>
              back to top <span aria-hidden>↑</span>
            </a>
          </Magnetic>
        </div>

        <div className="label-meta grid gap-x-8 gap-y-3 text-fg-muted md:grid-cols-2">
          <p>
            {profile.location} · {profile.timezone.label}
          </p>
          <TerminalHint label={footer.terminalHint} className="pointer-coarse:hidden md:justify-self-end" />
          <p className="md:col-start-1">
            © {footer.year} {profile.name}
          </p>
        </div>
      </div>
    </section>
  );
}
