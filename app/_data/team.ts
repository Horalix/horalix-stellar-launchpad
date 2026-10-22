export type TeamMember = {
  id: string;
  name: string;
  role: string;
  focus: string;
  image: string;
  initials: string;
  /** Doubles as the visible profile link and the Person `sameAs` value. */
  linkedin: string;
};

/**
 * Single source of truth for the team. /about renders the cards and the canonical Person
 * records; /resources/[slug] emits Person nodes with the same @id for its author and
 * reviewer. Both read from here so an author's identity can never differ between the two.
 */
export const team: TeamMember[] = [
  {
    id: "kerim-sabic",
    name: "Kerim Sabic",
    role: "CEO & Co-Founder",
    focus: "Clinical workflow, product direction, and hospital partnerships",
    image: "/team/kerim-sabic.webp",
    initials: "KS",
    linkedin: "https://www.linkedin.com/in/kerims/",
  },
  {
    id: "amr-husain",
    name: "Amr Husain",
    role: "CFO & Co-Founder",
    focus: "Finance, operations, and company development",
    image: "/team/amr-husain.webp",
    initials: "AH",
    linkedin: "https://www.linkedin.com/in/amr-husain-6ab6b71b/",
  },
  {
    id: "affan-kapidzic",
    name: "Affan Kapidzic",
    role: "CTO",
    focus: "Platform architecture and software engineering",
    image: "/team/affan-kapidzic.webp",
    initials: "AK",
    linkedin: "https://www.linkedin.com/in/affan-kapidzic/",
  },
  {
    id: "neuman-alkhalil",
    name: "Neuman Alkhalil",
    role: "CSO",
    focus: "Machine learning and model evaluation",
    image: "/team/neuman-alkhalil.webp",
    initials: "NA",
    linkedin: "https://www.linkedin.com/in/neuman-alkhalil/",
  },
];

export type Advisor = {
  id: string;
  name: string;
  role: string;
  /** One-line background, company-supplied. Rendered under the role on the card. */
  bio: string;
  /** Empty string renders the monogram fallback instead of a broken image. */
  image: string;
  initials: string;
};

/**
 * Advisors are deliberately a separate list from `team`. They are not employees, so their
 * Person nodes carry no `worksFor` — the relationship is expressed on the organization as
 * `member`, which is what schema.org actually models for a non-employment affiliation.
 */
export const advisors: Advisor[] = [
  {
    id: "bojan-lazic",
    name: "Bojan Lazic",
    role: "Advisor",
    bio: "Venture builder, angel investor, and longtime Techstars All-Star Mentor, with 15+ years of experience building and scaling companies across Europe and the U.S.",
    image: "/advisors/bojan-lazic.webp",
    initials: "BL",
  },
  {
    id: "damir-vrabac",
    name: "Damir Vrabac",
    role: "Advisor",
    bio: "Stanford-trained AI researcher and co-founder of Valar Labs, an AI precision-oncology company backed by a16z and DCVC with $26M in funding.",
    image: "/advisors/damir-vrabac.webp",
    initials: "DV",
  },
  {
    id: "nabil-naser",
    name: "Nabil Naser",
    role: "Clinical advisor",
    bio: "Professor and consultant cardiologist specializing in cardiac imaging and echocardiography, with FACC, FESC, FASE and FEACVI fellowships.",
    image: "/advisors/nabil-naser.webp",
    initials: "NN",
  },
  {
    id: "taib-delic",
    name: "Taib Delic",
    role: "Clinical advisor",
    bio: "Specialist in gynecology and obstetrics with extensive experience in medical ultrasound, perinatal medicine, clinical leadership, and physician education.",
    image: "/advisors/taib-delic.webp",
    initials: "TD",
  },
];

export function teamMember(id: string) {
  return team.find((member) => member.id === id);
}

/** Person node for an advisor. No `worksFor`: advising is not employment. */
export function advisorNode(id: string) {
  const advisor = advisors.find((entry) => entry.id === id);
  const url = `https://horalix.com/about#${id}`;
  if (!advisor) return { "@type": "Person", "@id": url, url };
  return {
    "@type": "Person",
    "@id": url,
    name: advisor.name,
    jobTitle: advisor.role,
    url,
    description: advisor.bio,
    ...(advisor.image ? { image: `https://horalix.com${advisor.image}` } : {}),
  };
}

/** Person node for the schema graph, keyed by the canonical /about anchor. */
export function personNode(id: string) {
  const member = teamMember(id);
  const url = `https://horalix.com/about#${id}`;
  if (!member) return { "@type": "Person", "@id": url, url };
  return {
    "@type": "Person",
    "@id": url,
    name: member.name,
    jobTitle: member.role,
    url,
    worksFor: { "@id": "https://horalix.com/#organization" },
    knowsAbout: member.focus,
    sameAs: [member.linkedin],
    image: `https://horalix.com${member.image}`,
  };
}
