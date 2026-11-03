import { getSection, sectionLabel, site } from "@/content/site";
import { resolveAsset } from "@/lib/media";
import { RevealText } from "@/components/motion";
import { ArchiveList } from "@/components/archive/archive-list";

const section = getSection("archive");

/** 03 / ARCHIVE — compact rows; previews are resolved here, on the server. */
export function Archive() {
  const { archive } = site;
  const previews = archive.map((entry) => resolveAsset(entry.preview));
  const count = String(archive.length).padStart(2, "0");

  return (
    <section id="archive" aria-labelledby="archive-title" className="section-pad border-t border-line">
      <div className="container-site grid-site gap-y-8">
        <div className="label-meta col-span-full flex items-center gap-4 text-fg-muted">
          <p>{sectionLabel(section)}</p>
          <span aria-hidden className="h-px flex-1 bg-line" />
          <p>{count} entries</p>
        </div>
        <RevealText
          id="archive-title"
          lines={[section.title]}
          className="col-span-full font-display text-display-xl lg:col-span-8"
        />
      </div>

      <div className="container-site mt-12 lg:mt-16">
        <ArchiveList entries={archive} previews={previews} />
      </div>
    </section>
  );
}
