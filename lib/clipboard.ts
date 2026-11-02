import { toast } from "sonner";

import { site } from "@/content/site";

/** Async Clipboard API, falling back to execCommand for insecure contexts. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}

/** Copies the contact email and confirms with a toast. */
export async function copyEmail() {
  const { email } = site.profile;
  if (await copyText(email)) toast("email copied", { description: email });
  else toast("couldn't copy — select it instead", { description: email });
}
