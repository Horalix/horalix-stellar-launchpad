export type Screenshot = {
  id: string;
  src: string;
  width: number;
  height: number;
  /** Alt text: what a screen-reader user needs. Short. */
  alt: string;
  /** Caption: printed under the image and used as the ImageObject caption. */
  caption: string;
  /** Longer description for ImageObject — this is what AI summarisers quote. */
  description: string;
};

/**
 * Real interface captures, used both as page imagery and as ImageObject nodes.
 * One definition per shot so the visible caption and the structured-data caption can
 * never disagree — a mismatch there is exactly what makes image markup untrustworthy.
 *
 * Study identifiers visible in these captures belong to test studies, not patients.
 */
export const screenshots: Screenshot[] = [
  {
    id: "study-list",
    src: "/product/echo-study-list.webp",
    width: 1920,
    height: 578,
    alt: "Horalix study list showing three completed echocardiography studies with processing status",
    caption: "Study intake — eligible studies arrive with processing status visible.",
    description:
      "The Horalix study list. Echocardiography studies appear with their DICOM study UID, acquisition date, and processing state (completed, processing, failed), so an echo lab can see at a glance which studies have been prepared for review.",
  },
  {
    id: "ai-overlay",
    src: "/product/echo-ai-overlay.webp",
    width: 1920,
    height: 1044,
    alt: "Echocardiogram with AI-generated measurement overlays labelled on the source image",
    caption: "AI-assisted preparation — every measurement stays attached to the view that produced it.",
    description:
      "A parasternal long-axis echocardiogram with Horalix measurement overlays drawn on the source image: ascending aorta, aortic root, IVC diameter, interventricular septum, left atrial diameter, LV internal diameter, and posterior wall thickness. Each overlay can be toggled individually, and the panel states that the result is AI-assisted for clinical review, not a diagnosis. The underlying DICOM is never modified.",
  },
  {
    id: "measurements",
    src: "/product/echo-ai-measurements.webp",
    width: 1920,
    height: 1043,
    alt: "Left ventricle segmentation with a structured panel of 54 cardiac measurements",
    caption: "Clinician review — segmented chamber beside the full structured measurement set.",
    description:
      "Horalix left-ventricle segmentation on an apical four-chamber view, beside the structured measurement panel reading 54 total measurements. Values are grouped into keypoint measurements (ejection fraction, global longitudinal strain, pulmonary artery pressure), valves, left ventricle, and atria, each editable by the reviewing clinician before sign-off.",
  },
];

export function screenshot(id: string) {
  const found = screenshots.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown screenshot: ${id}`);
  return found;
}

/** ImageObject node for the schema graph. */
export function imageNode(id: string) {
  const shot = screenshot(id);
  return {
    "@type": "ImageObject",
    "@id": `https://horalix.com/platform#${shot.id}`,
    contentUrl: `https://horalix.com${shot.src}`,
    url: `https://horalix.com${shot.src}`,
    width: shot.width,
    height: shot.height,
    caption: shot.caption,
    description: shot.description,
    representativeOfPage: shot.id === "measurements",
    creditText: "Horalix",
    creator: { "@id": "https://horalix.com/#organization" },
    copyrightNotice: "© Horalix",
  };
}
