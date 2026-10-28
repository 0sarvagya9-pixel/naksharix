/** Return the original of an official Wikimedia thumbnail, never a fabricated host swap.
 * Image URLs and rights credit remain tied to the same Commons File page.
 */
export function wikimediaOriginalForThumbnail(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "thumb.wikimedia.org" ||
        url.username || url.password || url.port || url.search || url.hash) return null;
    const match = /^\/wikipedia\/commons\/thumb\/([a-f0-9])\/([a-f0-9]{2})\/([^/]+)\/[0-9]+px-[^/]+$/i.exec(url.pathname);
    if (!match) return null;
    // Wikimedia original paths do not contain the thumbnail's final size/filename segment.
    return "https://upload.wikimedia.org/wikipedia/commons/" + match[1] + "/" + match[2] + "/" + match[3];
  } catch { return null; }
}
