import { isPlaceholder, isSectionVisible, site } from "@/content/site";
import { Hero } from "@/components/sections/hero";
import { StackBand } from "@/components/sections/stack-band";
import { Work } from "@/components/sections/work";
import { Principles } from "@/components/sections/principles";
import { Archive } from "@/components/sections/archive";
import { Education } from "@/components/sections/education";
import { Now } from "@/components/sections/now";
import { Contact } from "@/components/sections/contact";

/** JSON-LD Person schema. Placeholder socials are left out of `sameAs`. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.profile.name,
  url: site.meta.url,
  email: `mailto:${site.profile.email}`,
  jobTitle: site.profile.role,
  description: site.profile.roleLine,
  address: {
    "@type": "PostalAddress",
    addressRegion: site.profile.location.split(",")[0],
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: site.education.school,
  },
  knowsAbout: site.stack,
  sameAs: site.socials.map((s) => s.href).filter((href) => !isPlaceholder(href)),
};

export default function Home() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        // Escape "<" so content can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\u003c") }}
      />
      <Hero />
      <StackBand />
      <Work />
      <Principles />
      {isSectionVisible("archive") && <Archive />}
      <Education />
      <Now />
      <Contact />
    </main>
  );
}
