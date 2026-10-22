import { Arrow } from "./SiteChrome";

/**
 * Official Techstars wordmark (techstars.com). The wordmark inherits currentColor so the
 * reversed treatment works on the dark band; the accent bar keeps the brand green.
 */
export function TechstarsMark() {
  return (
    <svg className="program-mark" role="img" aria-label="Techstars" viewBox="0 0 160 37" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M2.736 10.271H0v3.766h2.736v8.69c0 4.022 1.448 4.86 5.728 4.86h3.38v-3.83H10.33c-1.77 0-2.285-.323-2.285-1.964v-7.756h3.798V10.27H8.046v-4.73h-5.31v4.73zm23.048 11.876c-.611 1.03-1.866 1.738-3.894 1.738-1.931 0-3.83-1.126-3.99-3.605h12.84c.355-6.179-3.153-10.524-8.914-10.524-5.053 0-9.27 3.54-9.27 9.076 0 5.761 3.863 9.173 9.495 9.173 3.444 0 7.08-1.77 8.625-5.858h-4.892zm-3.958-8.335c2.027 0 3.54 1.062 3.636 3.25h-7.498c.29-2.285 1.963-3.25 3.862-3.25zm18.749-4.056c-5.246 0-8.85 3.573-8.85 9.076 0 5.504 3.153 9.173 8.85 9.173 3.476 0 7.628-1.642 8.818-6.791h-4.956c-.386 1.641-1.577 2.671-3.54 2.671-1.899 0-3.766-1.255-3.766-5.02 0-3.702 1.867-4.99 3.766-4.99 1.577 0 2.832.709 3.315 2.736h4.956c-1.03-5.213-4.988-6.855-8.593-6.855zm15.589-5.503h-5.31v23.333h5.31v-8.883c0-3.218.965-4.698 3.25-4.698 2.575 0 2.64 2.027 2.64 4.505v9.076h5.31V17.191c0-4.699-1.384-7.306-5.825-7.306-2.736 0-4.603 1.384-5.375 2.671V4.253zm29.215 11.103c-.676-3.958-4.248-5.535-8.207-5.535-4.28 0-7.917 1.899-7.917 5.342 0 3.09 2.285 4.763 5.632 5.31l3.09.515c2.027.355 2.703.837 2.703 1.61 0 1.03-1.32 1.544-3.218 1.544-1.835 0-3.154-.514-3.637-2.188h-4.924c.612 4.087 3.894 6.05 8.497 6.05 4.795 0 8.367-1.963 8.367-5.857 0-3.057-1.995-4.28-6.147-5.053l-3.218-.58c-1.513-.289-2.124-.74-2.124-1.544 0-.869.933-1.287 2.768-1.287 1.673 0 3.025.386 3.379 1.673h4.956zm3.044-5.085h-2.736v3.766h2.736v8.69c0 4.022 1.448 4.86 5.729 4.86h3.379v-3.83h-1.513c-1.77 0-2.285-.323-2.285-1.964v-7.756h3.798V10.27h-3.798v-4.73h-5.31v4.73zm21.44 6.501c-6.726.515-11.522 1.9-11.522 6.148 0 3.154 2.704 5.085 5.986 5.085 2.479 0 4.538-.676 5.826-2.51l.064 2.091h5.214c-.258-1.062-.386-3.122-.386-5.02v-1.803l.064-3.765c.097-5.246-2.736-7.274-7.724-7.274-5.15 0-8.24 2.897-8.497 6.147h4.957c.225-1.673 1.384-2.542 3.089-2.542 1.931 0 2.929.708 2.929 2.768v.675zm.129 3.54c0 3.187-1.609 4.088-3.734 4.088-1.384 0-2.446-.74-2.446-1.867 0-1.899 2.479-2.285 6.18-2.639v.419zm18.066-10.137c-.129-.033-.258-.033-.418-.033h-.387c-2.478.097-3.926 1.352-4.731 3.412v-3.283h-5.117v17.315h5.31v-8.69c0-2.703 1.32-3.636 3.895-3.636.482 0 .836 0 1.448.096v-5.181zm16.612 5.181c-.676-3.958-4.248-5.535-8.207-5.535-4.28 0-7.917 1.899-7.917 5.342 0 3.09 2.285 4.763 5.632 5.31l3.09.515c2.028.355 2.703.837 2.703 1.61 0 1.03-1.319 1.544-3.218 1.544-1.834 0-3.154-.514-3.637-2.188h-4.924c.612 4.087 3.894 6.05 8.497 6.05 4.795 0 8.368-1.963 8.368-5.857 0-3.057-1.996-4.28-6.148-5.053l-3.218-.58c-1.513-.289-2.124-.74-2.124-1.544 0-.869.933-1.287 2.768-1.287 1.673 0 3.025.386 3.379 1.673h4.956z" />
      <path fill="#39C463" d="M159.851 32.06v-4.474h-14.322v4.474h14.322z" />
    </svg>
  );
}

/**
 * NVIDIA Inception lockup: the official NVIDIA corporate logo (eye mark + wordmark, taken
 * from nvidia.com) set against the programme name, which is how the Inception lockup is
 * constructed. The eye mark keeps NVIDIA green; the wordmark inherits currentColor so the
 * reversed treatment works on dark.
 *
 * NOTE: this is the corporate logo composed with the programme name, NOT the official
 * Inception member badge artwork — that is distributed only through the Inception member
 * portal (Marketing assets → programme digital badge). Download the badge and save it as
 * public/partners/nvidia-inception.svg, then set this to true to use it verbatim.
 */
const NVIDIA_BADGE_AVAILABLE = false;

export function NvidiaInceptionMark() {
  if (NVIDIA_BADGE_AVAILABLE) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="program-mark program-mark-image" src="/partners/nvidia-inception.svg" alt="NVIDIA Inception" width={200} height={37} />;
  }
  return (
    <span className="program-lockup" role="img" aria-label="NVIDIA Inception">
      <svg className="nvidia-mark" viewBox="0 0 108.472 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="currentColor">
          <path d="M1072.628,253.918v-.3h.192c.105,0,.248.008.248.136s-.073.163-.2.163h-.243m0,.211h.129l.3.524h.327l-.33-.545a.3.3,0,0,0,.311-.323c0-.285-.2-.377-.53-.377h-.482v1.245h.276v-.524m1.4-.1a1.2,1.2,0,1,0-1.2,1.157,1.14,1.14,0,0,0,1.2-1.157m-.347,0a.854.854,0,0,1-.855.891v0a.889.889,0,1,1,.855-.887Z" transform="translate(-965.557 -237.878)" />
          <path d="M463.9,151.934v13.127h3.707V151.934Zm-29.164-.018v13.145h3.74v-10.2l2.918.01a2.674,2.674,0,0,1,2.086.724c.586.625.826,1.632.826,3.476v5.995h3.624V157.8c0-5.183-3.3-5.882-6.536-5.882Zm35.134.018v13.127h6.013c3.2,0,4.249-.533,5.38-1.727a7.352,7.352,0,0,0,1.316-4.692,7.789,7.789,0,0,0-1.2-4.516c-1.373-1.833-3.352-2.191-6.306-2.191Zm3.677,2.858h1.594c2.312,0,3.808,1.039,3.808,3.733s-1.5,3.734-3.808,3.734h-1.594Zm-14.992-2.858-3.094,10.4-2.965-10.4h-4l4.234,13.127h5.343l4.267-13.127Zm25.749,13.127h3.708V151.935h-3.709ZM494.7,151.939l-5.177,13.117h3.656l.819-2.318h6.126l.775,2.318h3.969l-5.216-13.118Zm2.407,2.393,2.246,6.145h-4.562Z" transform="translate(-399.551 -148.155)" />
        </g>
        <path fill="#74b71b" d="M129.832,124.085v-1.807c.175-.013.353-.022.533-.028,4.941-.155,8.183,4.246,8.183,4.246s-3.5,4.863-7.255,4.863a4.553,4.553,0,0,1-1.461-.234v-5.478c1.924.232,2.31,1.082,3.467,3.01l2.572-2.169a6.81,6.81,0,0,0-5.042-2.462,9.328,9.328,0,0,0-1,.059m0-5.968v2.7c.177-.014.355-.025.533-.032,6.871-.232,11.348,5.635,11.348,5.635s-5.142,6.253-10.5,6.253a7.906,7.906,0,0,1-1.383-.122v1.668a9.1,9.1,0,0,0,1.151.075c4.985,0,8.59-2.546,12.081-5.559.578.463,2.948,1.591,3.435,2.085-3.319,2.778-11.055,5.018-15.44,5.018-.423,0-.829-.026-1.228-.064v2.344h18.947v-20Zm0,13.009v1.424c-4.611-.822-5.89-5.615-5.89-5.615a9.967,9.967,0,0,1,5.89-2.85v1.563h-.007a4.424,4.424,0,0,0-3.437,1.571s.845,3.035,3.444,3.908m-8.189-4.4a11.419,11.419,0,0,1,8.189-4.449v-1.463c-6.043.485-11.277,5.6-11.277,5.6s2.964,8.569,11.277,9.354v-1.555C123.731,133.451,121.643,126.728,121.643,126.728Z" transform="translate(-118.555 -118.117)" />
      </svg>
      <em>Inception</em>
    </span>
  );
}

const programs = [
  {
    id: "techstars",
    name: "Techstars Sarajevo Founder Catalyst",
    detail: "Selected for the Fall 2025 cohort",
    href: "https://www.techstars.com/blog/program-news/techstars-launches-first-startup-community-partnership-founder-catalyst",
    mark: <TechstarsMark />,
  },
  {
    id: "nvidia-inception",
    name: "NVIDIA Inception",
    detail: "Member of NVIDIA’s startup-support program",
    href: "https://www.nvidia.com/en-us/startups/",
    mark: <NvidiaInceptionMark />,
  },
];

/**
 * `compact` drops the section chrome so the row can be nested inside another section —
 * used on the homepage, where the programmes ride along with the pilot collaborations
 * instead of costing a full band of their own.
 */
export function ProgramLogoRow() {
  return (
    <div className="program-logo-inline">
      <p className="eyebrow">Also on the record</p>
      <ul className="program-logo-row">
        {programs.map((program) => (
          <li key={program.id}>
            <a href={program.href} rel="noreferrer">
              {program.mark}
              <span className="program-logo-meta"><b>{program.name}</b><small>{program.detail}</small></span>
              <Arrow />
            </a>
          </li>
        ))}
      </ul>
      <p className="program-logo-disclosure">
        Program participation does not imply investment, certification, product endorsement, regulatory status, or clinical validation.
      </p>
    </div>
  );
}

export function ProgramLogos({ tone = "light", eyebrow = "Recognized by", heading }: { tone?: "light" | "dark"; eyebrow?: string; heading?: string }) {
  return (
    <section className={tone === "dark" ? "program-logos program-logos-dark section-dark" : "program-logos"} aria-label="Programs Horalix participates in">
      <div className="shell">
        <div className="program-logos-head"><p className="eyebrow">{eyebrow}</p>{heading && <h2>{heading}</h2>}</div>
        <ul className="program-logo-row">
          {programs.map((program) => (
            <li key={program.id}>
              <a href={program.href} rel="noreferrer">
                {program.mark}
                <span className="program-logo-meta"><b>{program.name}</b><small>{program.detail}</small></span>
                <Arrow />
              </a>
            </li>
          ))}
        </ul>
        <p className="program-logo-disclosure">
          Program participation does not imply investment, certification, product endorsement, regulatory status, or clinical validation.
        </p>
      </div>
    </section>
  );
}
