// Educational definitions for the echocardiography and clinical-AI terms Horalix pages rely on.
// Each entry opens with a self-contained answer so it can be quoted on its own, keeps product
// language out of the definition, and names the primary sources it follows.

export type GlossaryTerm = {
  slug: string;
  name: string;
  abbreviation?: string;
  alternateNames?: string[];
  /** The question the term page answers; defaults to "What is <name> (<abbreviation>)?". */
  question?: string;
  definition: string;
  explanation: string[];
  inPractice: string;
  related: string[];
  resources: { title: string; href: string }[];
  sources: { title: string; href: string }[];
};

/** When the glossary content was last reviewed; used for page and sitemap dates. */
export const glossaryReviewed = "2026-10-22";

const chamberQuantification = { title: "ASE/EACVI recommendations for cardiac chamber quantification in adults", href: "https://pubmed.ncbi.nlm.nih.gov/25559473/" };
const reportingStandard = { title: "Guidelines for the standardization of adult echocardiography reporting (ASE)", href: "https://pubmed.ncbi.nlm.nih.gov/40912865/" };
const diastolicFunction = { title: "Recommendations for the evaluation of left ventricular diastolic function by echocardiography (ASE/EACVI)", href: "https://pubmed.ncbi.nlm.nih.gov/27422899/" };
const strainStandard = { title: "Definitions for a common standard for 2D speckle tracking echocardiography (EACVI/ASE/Industry Task Force)", href: "https://pubmed.ncbi.nlm.nih.gov/25525063/" };
const rightHeart = { title: "Guidelines for the echocardiographic assessment of the right heart in adults (ASE)", href: "https://doi.org/10.1016/j.echo.2010.05.010" };
const diastolicReproducibility = { title: "Interrater reproducibility of the 2016 ASE left ventricular diastolic function guidelines", href: "https://pubmed.ncbi.nlm.nih.gov/35342988/" };
const focusReview = { title: "Diagnostic and prognostic role of focused cardiac ultrasound by non-cardiologist specialists — systematic review", href: "https://pubmed.ncbi.nlm.nih.gov/42309622/" };
const dicomStandard = { title: "DICOM standard", href: "https://www.dicomstandard.org/current" };
const automationBiasReview = { title: "Automation bias: a systematic review of frequency, effect mediators, and mitigators", href: "https://pubmed.ncbi.nlm.nih.gov/21685142/" };
const futureAi = { title: "FUTURE-AI international consensus guideline", href: "https://www.bmj.com/content/388/bmj-2024-081554" };
const aiAct = { title: "Regulation (EU) 2024/1689 — Artificial Intelligence Act", href: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj" };
const mdr = { title: "Regulation (EU) 2017/745 — Medical Device Regulation", href: "https://eur-lex.europa.eu/eli/reg/2017/745/oj" };
const aiDeviceClassification = { title: "Regulatory classification of AI-enabled products under the EU AI Act and MDR/IVDR", href: "https://pubmed.ncbi.nlm.nih.gov/40643665/" };

export const glossary: GlossaryTerm[] = [
  {
    slug: "echocardiography",
    name: "Echocardiography",
    alternateNames: ["Echo", "Cardiac ultrasound", "Transthoracic echocardiography (TTE)"],
    definition: "Echocardiography is ultrasound imaging of the heart. It shows the heart's chambers, walls, valves and blood flow in real time, without ionising radiation, and is the most widely used cardiac imaging test.",
    explanation: [
      "A transthoracic echocardiogram (TTE) is recorded with a probe on the chest wall. A transoesophageal echocardiogram (TOE, or TEE in North America) places the probe in the oesophagus for a closer view of structures such as the valves and the left atrial appendage. Both combine two-dimensional imaging with Doppler, which measures the speed and direction of blood flow.",
      "A complete study is a sequence of standard views acquired by a sonographer or cardiologist, followed by measurement and reporting. Chamber sizes, wall thickness, systolic and diastolic function and valve gradients are measured from those views and written into a report that a cardiologist signs.",
    ],
    inPractice: "Much of the time in an echo study is spent after acquisition: selecting frames, tracing borders and entering measurements. That post-acquisition work is where AI-assisted echocardiography workflows are aimed, preparing measurements from the stored images for a clinician to review rather than changing how the images are taken.",
    related: ["standard-echocardiographic-views", "structured-echocardiography-reporting", "left-ventricular-ejection-fraction"],
    resources: [
      { title: "Where echo reporting time actually goes", href: "/resources/echo-reporting-burden" },
      { title: "What AI echocardiography software actually does", href: "/resources/ai-echocardiography-software-guide" },
    ],
    sources: [chamberQuantification, reportingStandard],
  },
  {
    slug: "left-ventricular-ejection-fraction",
    name: "Left ventricular ejection fraction",
    abbreviation: "LVEF",
    alternateNames: ["Ejection fraction", "EF"],
    definition: "Left ventricular ejection fraction (LVEF) is the percentage of blood in the left ventricle that is pumped out with each heartbeat. It is the most commonly reported measure of how well the heart's main pumping chamber contracts.",
    explanation: [
      "LVEF is calculated from the left ventricle's volume at the end of filling (end-diastolic volume) and at the end of contraction (end-systolic volume): the stroke volume divided by the end-diastolic volume. In echocardiography the volumes are usually measured with the biplane method of discs, also called the modified Simpson's rule, from the apical four- and two-chamber views.",
      "Chamber-quantification guidelines group LVEF into normal and mildly, moderately or severely abnormal ranges, and heart-failure guidelines use it to separate reduced, mildly reduced and preserved ejection fraction. Because it depends on tracing the inner border of the ventricle in two frames of two views, LVEF is also one of the measurements most affected by image quality and by who is measuring.",
    ],
    inPractice: "LVEF is a natural target for assisted measurement because its inputs, frame selection and border tracing, are repetitive and well defined. Any automatically prepared LVEF still needs a clinician to check the chosen frames and traced borders before the value enters a report.",
    related: ["biplane-method-of-discs", "global-longitudinal-strain", "inter-observer-variability"],
    resources: [{ title: "Automated versus manual echo measurement", href: "/resources/automated-vs-manual-echo-measurement" }],
    sources: [chamberQuantification],
  },
  {
    slug: "global-longitudinal-strain",
    name: "Global longitudinal strain",
    abbreviation: "GLS",
    alternateNames: ["Speckle-tracking strain", "LV GLS"],
    definition: "Global longitudinal strain (GLS) measures how much the left ventricle's muscle shortens from base to apex during contraction, expressed as a percentage change in length. It is measured with speckle-tracking echocardiography and can reveal subtle dysfunction while ejection fraction is still normal.",
    explanation: [
      "Strain describes deformation: the change in length of a segment of myocardium relative to its original length. Because the ventricle shortens during systole, longitudinal strain values are negative, and a more negative number means stronger shortening. GLS averages the longitudinal strain of the ventricular segments across the apical views.",
      "Speckle tracking follows the natural acoustic pattern, or speckles, in the myocardium from frame to frame. The EACVI/ASE/Industry Task Force published common definitions to reduce differences between vendors' software, but values are still best compared on the same platform. GLS is used to monitor patients receiving potentially cardiotoxic cancer treatment and in the assessment of cardiomyopathies.",
    ],
    inPractice: "GLS already depends on software tracking, so the clinical questions are about tracking quality and reproducibility: which views were used, whether the tracking followed the myocardium, and whether serial studies were measured the same way.",
    related: ["left-ventricular-ejection-fraction", "inter-observer-variability", "standard-echocardiographic-views"],
    resources: [{ title: "Automated versus manual echo measurement", href: "/resources/automated-vs-manual-echo-measurement" }],
    sources: [strainStandard, chamberQuantification],
  },
  {
    slug: "e-e-prime-ratio",
    name: "E/e′ ratio",
    alternateNames: ["E/e' ratio", "E over e prime"],
    question: "What is the E/e′ ratio in echocardiography?",
    definition: "The E/e′ ratio compares the speed of blood flowing into the left ventricle in early diastole (E) with the speed at which the mitral annulus moves in the same phase (e′). It is one of the echocardiographic measurements used to estimate left ventricular filling pressure.",
    explanation: [
      "E is measured with pulsed-wave Doppler at the tips of the mitral valve leaflets. e′ is measured with tissue Doppler at the septal and lateral sides of the mitral annulus and usually averaged. A higher E/e′ suggests higher filling pressure in the left ventricle.",
      "No single number defines diastolic function. The ASE/EACVI recommendations combine E/e′ with e′ velocity, tricuspid regurgitation velocity and left atrial volume index, and grade diastolic dysfunction from how many of those criteria are abnormal.",
    ],
    inPractice: "Diastolic assessment is a multi-step algorithm across Doppler, tissue Doppler and volumetric measurements. That makes it a good example of where structured, consistently labelled measurements help, and of where every input still needs review: one misplaced Doppler sample can change the grade.",
    related: ["left-atrial-volume-index", "structured-echocardiography-reporting", "inter-observer-variability"],
    resources: [{ title: "Where echo reporting time actually goes", href: "/resources/echo-reporting-burden" }],
    sources: [diastolicFunction, diastolicReproducibility],
  },
  {
    slug: "tapse",
    name: "Tricuspid annular plane systolic excursion",
    abbreviation: "TAPSE",
    definition: "Tricuspid annular plane systolic excursion (TAPSE) measures how far the tricuspid annulus moves toward the apex of the heart during systole. It is a quick, reproducible echocardiographic measure of right ventricular longitudinal function.",
    explanation: [
      "TAPSE is recorded with M-mode through the lateral tricuspid annulus in the apical four-chamber view and reported in millimetres. Lower values indicate reduced right ventricular systolic function.",
      "Because it measures motion at one point in one direction, TAPSE is usually interpreted alongside other right-heart measures such as the tissue Doppler S′ velocity, fractional area change and right ventricular size, as described in the ASE right-heart guidelines.",
    ],
    inPractice: "TAPSE is a single line on an M-mode trace, which makes it fast to measure and also easy to measure in the wrong place. Showing the cursor position and trace beside the value lets a reviewer confirm it at a glance.",
    related: ["standard-echocardiographic-views", "echocardiography", "inter-observer-variability"],
    resources: [{ title: "Automated versus manual echo measurement", href: "/resources/automated-vs-manual-echo-measurement" }],
    sources: [rightHeart],
  },
  {
    slug: "biplane-method-of-discs",
    name: "Biplane method of discs",
    alternateNames: ["Modified Simpson's rule", "Biplane Simpson's method"],
    question: "What is the biplane method of discs (modified Simpson's rule)?",
    definition: "The biplane method of discs, or modified Simpson's rule, calculates left ventricular volume by tracing the inner border of the ventricle in two perpendicular apical views and adding up the volumes of a stack of elliptical discs. It is the recommended two-dimensional method for left ventricular volumes and ejection fraction.",
    explanation: [
      "The endocardial border of the left ventricle is traced in the apical four-chamber and two-chamber views at end-diastole and end-systole. The ventricle is divided into a series of discs along its long axis; each disc's diameters come from the two views, and the disc volumes are summed.",
      "Results depend on choosing the correct frames, avoiding foreshortened views and tracing the border consistently. Foreshortening, imaging the ventricle off-axis so that it looks shorter, systematically underestimates volumes.",
    ],
    inPractice: "Every input to the biplane method is visible: the frames chosen and the traced contours. That makes it reviewable, because a clinician can accept, adjust or redraw a contour, which is the right model for assisted measurement.",
    related: ["left-ventricular-ejection-fraction", "standard-echocardiographic-views", "inter-observer-variability"],
    resources: [{ title: "Automated versus manual echo measurement", href: "/resources/automated-vs-manual-echo-measurement" }],
    sources: [chamberQuantification],
  },
  {
    slug: "left-atrial-volume-index",
    name: "Left atrial volume index",
    abbreviation: "LAVI",
    alternateNames: ["LA volume index", "LAVi"],
    definition: "Left atrial volume index (LAVI) is the volume of the left atrium at end-systole divided by body surface area. An enlarged LAVI reflects chronically raised left-sided filling pressure and is one of the criteria used to assess diastolic function.",
    explanation: [
      "The left atrium is measured at its largest, just before the mitral valve opens, usually with the biplane method of discs from the apical four- and two-chamber views. Indexing to body surface area allows comparison between patients of different sizes.",
      "Volume is preferred over a single linear diameter because the atrium often enlarges unevenly. LAVI is part of the ASE/EACVI diastolic-function algorithm and of chamber-quantification reporting.",
    ],
    inPractice: "LAVI combines a traced volume with the patient's height and weight, so a correct value depends on both the image measurement and the demographic data reaching the report intact. That makes it an integration question as much as an imaging one.",
    related: ["e-e-prime-ratio", "biplane-method-of-discs", "dicom"],
    resources: [{ title: "DICOM echo workflow integration checklist", href: "/resources/dicom-echo-integration-checklist" }],
    sources: [chamberQuantification, diastolicFunction],
  },
  {
    slug: "focused-cardiac-ultrasound",
    name: "Focused cardiac ultrasound",
    abbreviation: "FoCUS",
    alternateNames: ["Point-of-care cardiac ultrasound", "Cardiac POCUS"],
    definition: "Focused cardiac ultrasound (FoCUS) is a limited, goal-directed cardiac ultrasound examination performed at the bedside to answer specific clinical questions, such as whether there is a pericardial effusion or severely reduced function. It complements a comprehensive echocardiogram and is not a substitute for one.",
    explanation: [
      "FoCUS is often performed by emergency physicians, intensivists and anaesthetists with handheld or point-of-care devices. It uses a small number of views and largely qualitative assessment, and is part of the broader practice of point-of-care ultrasound (POCUS).",
      "Its value depends on operator training and on knowing its limits: findings that need quantification or a full valve assessment should lead to a comprehensive echocardiogram.",
    ],
    inPractice: "FoCUS is a different problem from a full study, with fewer views, less experienced operators and bedside conditions. Evidence for AI in one setting does not transfer automatically to the other.",
    related: ["echocardiography", "standard-echocardiographic-views", "human-in-the-loop"],
    resources: [{ title: "Reading the focused cardiac ultrasound evidence honestly", href: "/resources/focused-cardiac-ultrasound-ai-evidence" }],
    sources: [focusReview],
  },
  {
    slug: "dicom",
    name: "DICOM",
    alternateNames: ["Digital Imaging and Communications in Medicine", "DICOM SR", "DICOM Structured Report"],
    question: "What is DICOM in echocardiography?",
    definition: "DICOM (Digital Imaging and Communications in Medicine) is the international standard for storing and exchanging medical images and their metadata. Echocardiography machines save studies as DICOM objects, and measurements can be exchanged as DICOM Structured Reports (DICOM SR).",
    explanation: [
      "A DICOM echo study contains the image loops and still frames together with patient, study and acquisition details such as frame rate and calibration. That metadata is what lets software convert pixels into millimetres and centimetres per second.",
      "DICOM SR carries measurements as coded, machine-readable values rather than free text, so they can move from an ultrasound system or analysis tool into a reporting system without retyping. Support for SR, and for the specific measurement codes a lab uses, varies between vendors.",
    ],
    inPractice: "Integration usually decides whether a clinical-AI pilot starts at all. Asking which DICOM objects are read, which are written back, and where they go (PACS, a reporting system or a separate viewer) is the first technical conversation for any hospital.",
    related: ["structured-echocardiography-reporting", "left-atrial-volume-index", "echocardiography"],
    resources: [
      { title: "DICOM echo workflow integration checklist", href: "/resources/dicom-echo-integration-checklist" },
      { title: "On-premise or cloud for hospital AI", href: "/resources/on-prem-vs-cloud-clinical-ai" },
    ],
    sources: [dicomStandard],
  },
  {
    slug: "structured-echocardiography-reporting",
    name: "Structured echocardiography reporting",
    alternateNames: ["Structured echo report", "Standardized echocardiography reporting"],
    definition: "Structured echocardiography reporting records findings and measurements in predefined, consistently named fields rather than free text. It makes reports more complete and comparable, and lets other systems reuse the measurements.",
    explanation: [
      "A structured report organises an echo study by chamber, valve and function, with each measurement in a defined field and unit and the conclusions drawn from those values. The American Society of Echocardiography publishes guidance on standardising adult echo reports.",
      "Free-text reports vary between readers and are hard to search or compare over time. Structured data also supports quality audits, registries and the follow-up of serial studies.",
    ],
    inPractice: "Structured output is where assisted measurement and reporting meet: values prepared from the images arrive in the fields a reporting clinician already uses, with the source frame available, instead of as a separate list to transcribe.",
    related: ["dicom", "echocardiography", "e-e-prime-ratio"],
    resources: [{ title: "Where echo reporting time actually goes", href: "/resources/echo-reporting-burden" }],
    sources: [reportingStandard],
  },
  {
    slug: "standard-echocardiographic-views",
    name: "Standard echocardiographic views",
    alternateNames: ["Echo views", "Apical four-chamber view", "Parasternal long-axis view", "View classification"],
    question: "What are the standard echocardiographic views?",
    definition: "Standard echocardiographic views are the defined probe positions and imaging planes used in every transthoracic study, such as the parasternal long-axis and apical four-chamber views. Each view shows specific structures, and most measurements are defined in one particular view.",
    explanation: [
      "A transthoracic study typically includes parasternal long- and short-axis views, apical four-, five-, two- and three-chamber views, subcostal views and suprasternal views. Guidelines define which measurement is taken in which view; for example, left ventricular volumes come from the apical four- and two-chamber views.",
      "Recognising the view is the first step of any measurement. Off-axis or foreshortened views lead to systematic measurement errors even when the tracing itself is careful.",
    ],
    inPractice: "Automated view classification sorts the loops of a study by view so that each measurement is taken from the right images. When the classification is shown to the reviewer, a wrong view is caught before it produces a wrong value.",
    related: ["biplane-method-of-discs", "tapse", "echocardiography"],
    resources: [{ title: "What AI echocardiography software actually does", href: "/resources/ai-echocardiography-software-guide" }],
    sources: [chamberQuantification],
  },
  {
    slug: "inter-observer-variability",
    name: "Inter-observer variability",
    alternateNames: ["Interobserver variability", "Inter-reader variability", "Intra-observer variability"],
    question: "What is inter-observer variability in echocardiography?",
    definition: "Inter-observer variability is the difference between measurements of the same study made by different people. In echocardiography it is a known source of inconsistency, especially for measurements that depend on manual tracing, such as LVEF.",
    explanation: [
      "Variability comes from frame selection, border tracing, cursor placement and the choice of view. Intra-observer variability is the same problem within one person measuring the same study twice.",
      "It matters most when studies are compared over time: a change in a value may reflect a change in the patient or simply a different reader. Standardised protocols, training and consistent methods reduce it.",
    ],
    inPractice: "Consistency is one argument for assisted measurement: the same method applied to every study. Whether a given tool is more consistent than its users is an empirical question that should be answered with data from the lab's own studies.",
    related: ["left-ventricular-ejection-fraction", "global-longitudinal-strain", "biplane-method-of-discs"],
    resources: [
      { title: "Automated versus manual echo measurement", href: "/resources/automated-vs-manual-echo-measurement" },
      { title: "How to evaluate pilot-stage clinical AI", href: "/resources/evaluating-pilot-stage-clinical-ai" },
    ],
    sources: [chamberQuantification, diastolicReproducibility],
  },
  {
    slug: "human-in-the-loop",
    name: "Human-in-the-loop",
    alternateNames: ["Human oversight", "Clinician-in-the-loop"],
    question: "What does human-in-the-loop mean in clinical AI?",
    definition: "Human-in-the-loop describes a clinical AI system in which a qualified person reviews, corrects and approves the system's output before it affects care. The clinician, not the software, remains responsible for the final decision.",
    explanation: [
      "Oversight has to be designed in: the reviewer needs to see what the system proposed, the evidence behind it, and a quick way to accept, adjust or reject it. The EU AI Act requires effective human oversight for high-risk AI systems, a category that includes AI-enabled medical devices.",
      "International guidance such as the FUTURE-AI consensus lists human oversight alongside fairness, robustness and explainability as conditions for trustworthy medical AI.",
    ],
    inPractice: "In an echo workflow, human-in-the-loop means every prepared measurement is traceable to its source frame and every report is signed by a clinician. Horalix is built around that sign-off step.",
    related: ["automation-bias", "software-as-a-medical-device", "structured-echocardiography-reporting"],
    resources: [{ title: "Human oversight in AI-assisted echocardiography", href: "/resources/human-oversight-in-echo-ai" }],
    sources: [aiAct, futureAi],
  },
  {
    slug: "automation-bias",
    name: "Automation bias",
    question: "What is automation bias in clinical AI?",
    definition: "Automation bias is the tendency to accept a computer's suggestion without enough scrutiny, including when the suggestion is wrong. It is a recognised risk whenever clinicians review AI-generated output.",
    explanation: [
      "A systematic review in the Journal of the American Medical Informatics Association found that automation bias is influenced by workload, time pressure, task complexity, experience and trust in the system, and that training, accountability and interface design can reduce it.",
      "It shows up as errors of commission, accepting an incorrect suggestion, and errors of omission, missing a problem because the system did not flag it.",
    ],
    inPractice: "Review screens can make automation bias more or less likely. Showing the source frame and traced contour next to each value, and making adjustment as easy as acceptance, keeps the reviewer looking at the image rather than only at the number.",
    related: ["human-in-the-loop", "inter-observer-variability"],
    resources: [{ title: "Human oversight in AI-assisted echocardiography", href: "/resources/human-oversight-in-echo-ai" }],
    sources: [automationBiasReview],
  },
  {
    slug: "software-as-a-medical-device",
    name: "Software as a medical device",
    abbreviation: "SaMD",
    alternateNames: ["Medical device software", "MDSW"],
    definition: "Software as a medical device (SaMD) is software intended by its manufacturer to be used for a medical purpose on its own, without being part of a hardware device. In the EU, such software is regulated under the Medical Device Regulation (MDR) according to its intended purpose and risk class.",
    explanation: [
      "Under the EU MDR, software that provides information used to take diagnostic or therapeutic decisions is generally classified at least as class IIa, which requires assessment by a notified body before it can carry a CE mark. The classification follows from the manufacturer's stated intended purpose.",
      "AI-based medical software is also covered by the EU AI Act, which treats AI systems that are, or are safety components of, regulated medical devices as high-risk and adds requirements for data governance, transparency and human oversight.",
    ],
    inPractice: "Pre-clearance means a product has not yet completed that conformity assessment. Horalix is pilot-stage and pre-clearance, and its public materials say so wherever product status matters.",
    related: ["human-in-the-loop", "automation-bias"],
    resources: [
      { title: "EU MDR and the AI Act: what pre-clearance really means", href: "/resources/eu-mdr-clinical-ai-pathway" },
      { title: "GDPR and clinical AI hospital pilots", href: "/resources/gdpr-clinical-ai-hospital-pilots" },
    ],
    sources: [mdr, aiAct, aiDeviceClassification],
  },
];

export function getGlossaryTerm(slug: string) {
  return glossary.find((term) => term.slug === slug);
}

/** The display label, e.g. "Left ventricular ejection fraction (LVEF)". */
export function termLabel(term: GlossaryTerm) {
  return term.abbreviation ? `${term.name} (${term.abbreviation})` : term.name;
}

export function termQuestion(term: GlossaryTerm) {
  return term.question ?? `What is ${term.abbreviation ? `${term.name.charAt(0).toLowerCase()}${term.name.slice(1)} (${term.abbreviation})` : term.name.toLowerCase()}?`;
}

/** Terms in alphabetical order for the hub. */
export function glossaryAlphabetical() {
  return [...glossary].sort((a, b) => a.name.localeCompare(b.name, "en"));
}
