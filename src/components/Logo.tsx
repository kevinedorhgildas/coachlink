const GOLD = "#C9A96E";
const NAVY = "#0B1120";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
  showTagline?: boolean;
};

const sizes = {
  sm: { icon: 28, text: 14, tagline: 7, gap: 8 },
  md: { icon: 36, text: 18, tagline: 8, gap: 10 },
  lg: { icon: 48, text: 24, tagline: 10, gap: 14 },
};

export default function Logo({ size = "md", theme = "light", showTagline = false }: LogoProps) {
  const s = sizes[size];
  const textColor = theme === "dark" ? "#ffffff" : NAVY;
  const iconSecondary = theme === "dark" ? "#ffffff" : NAVY;
  const totalWidth = s.icon + s.gap + (s.text * 7.5);
  const height = showTagline ? s.icon + 14 : s.icon;

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CoachLink"
      role="img"
    >
      {/* Maillon gauche */}
      <rect
        x={2}
        y={(s.icon - s.icon * 0.6) / 2}
        width={s.icon * 0.6}
        height={s.icon * 0.6}
        rx={s.icon * 0.3}
        fill="none"
        stroke={GOLD}
        strokeWidth={s.icon * 0.13}
      />
      {/* Maillon droit */}
      <rect
        x={s.icon * 0.32}
        y={(s.icon - s.icon * 0.6) / 2}
        width={s.icon * 0.6}
        height={s.icon * 0.6}
        rx={s.icon * 0.3}
        fill="none"
        stroke={iconSecondary}
        strokeWidth={s.icon * 0.13}
      />
      {/* Texte Coach */}
      <text
        x={s.icon + s.gap}
        y={s.icon * 0.58}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={s.text}
        fontWeight="700"
        fill={textColor}
        letterSpacing="-0.5"
      >
        Coach
      </text>
      {/* Texte Link */}
      <text
        x={s.icon + s.gap + s.text * 3.8}
        y={s.icon * 0.58}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={s.text}
        fontWeight="300"
        fill={GOLD}
        letterSpacing="-0.5"
      >
        Link
      </text>
      {/* Tagline optionnelle */}
      {showTagline && (
        <text
          x={s.icon + s.gap}
          y={s.icon * 0.58 + s.tagline + 6}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize={s.tagline}
          fontWeight="400"
          fill={theme === "dark" ? "#ffffff60" : "#88888888"}
          letterSpacing="1.5"
        >
          PLATEFORME COACH
        </text>
      )}
    </svg>
  );
}
