import { SectionShell } from "@/components/sections/section-shell";
import { Hero } from "@/components/sections/hero";
import { StackBand } from "@/components/sections/stack-band";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <StackBand />

      <SectionShell id="work" phase={3} />
      <SectionShell id="principles" phase={5} />
      <SectionShell id="archive" phase={5} />
      <SectionShell id="education" phase={5} />
      <SectionShell id="now" phase={5} />
      <SectionShell id="contact" phase={5} />
    </main>
  );
}
