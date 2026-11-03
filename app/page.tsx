import { Hero } from "@/components/sections/hero";
import { StackBand } from "@/components/sections/stack-band";
import { Work } from "@/components/sections/work";
import { Principles } from "@/components/sections/principles";
import { Archive } from "@/components/sections/archive";
import { Education } from "@/components/sections/education";
import { Now } from "@/components/sections/now";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <StackBand />
      <Work />
      <Principles />
      <Archive />
      <Education />
      <Now />
      <Contact />
    </main>
  );
}
