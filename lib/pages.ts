// Turns what the student drops in (photos or a PDF) into page pictures,
// on their own device, before anything is sent anywhere.

export type PreparedPage = {
  page: number;
  url: string; // object URL for showing the page
  base64: string; // JPEG, for the reader
  width: number;
  height: number;
};

export const MAX_PAGES = 30;
const LONG_EDGE = 1600;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export class PageError extends Error {}

export function acceptedFile(f: File): boolean {
  return ACCEPTED.includes(f.type) || /\.(jpe?g|png|webp|pdf)$/i.test(f.name);
}

export async function preparePages(files: File[]): Promise<PreparedPage[]> {
  const bad = files.filter((f) => !acceptedFile(f));
  if (bad.length) throw new PageError(`${bad[0].name} isn't a photo or PDF. Use JPG, PNG or PDF.`);

  const canvases: HTMLCanvasElement[] = [];
  const ordered = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  for (const f of ordered) {
    if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) canvases.push(...(await renderPdf(f)));
    else canvases.push(await renderImage(f));
    if (canvases.length > MAX_PAGES) throw new PageError(`That's more than ${MAX_PAGES} pages. Upload one subject's answer book at a time.`);
  }
  if (canvases.length === 0) throw new PageError("No pages found in those files.");

  return Promise.all(
    canvases.map(async (c, i) => {
      const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new PageError("A page couldn't be prepared."))), "image/jpeg", 0.85));
      return { page: i + 1, url: URL.createObjectURL(blob), base64: await toBase64(blob), width: c.width, height: c.height };
    }),
  );
}

async function renderImage(f: File): Promise<HTMLCanvasElement> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(f, { imageOrientation: "from-image" });
  } catch {
    throw new PageError(`${f.name} couldn't be opened. If it's an iPhone photo, export it as JPG.`);
  }
  const s = Math.min(1, LONG_EDGE / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c;
}

async function renderPdf(f: File): Promise<HTMLCanvasElement[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  let doc;
  try {
    doc = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
  } catch {
    throw new PageError(`${f.name} couldn't be opened as a PDF.`);
  }
  if (doc.numPages > MAX_PAGES) throw new PageError(`That PDF has ${doc.numPages} pages. The limit is ${MAX_PAGES}.`);
  const out: HTMLCanvasElement[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const p = await doc.getPage(i);
    const base = p.getViewport({ scale: 1 });
    const viewport = p.getViewport({ scale: LONG_EDGE / Math.max(base.width, base.height) });
    const c = document.createElement("canvas");
    c.width = Math.round(viewport.width);
    c.height = Math.round(viewport.height);
    await p.render({ canvas: c, canvasContext: c.getContext("2d")!, viewport }).promise;
    out.push(c);
  }
  return out;
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = () => rej(new PageError("A page couldn't be read."));
    r.readAsDataURL(blob);
  });
}
