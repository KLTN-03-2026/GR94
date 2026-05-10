import React from "react";
import * as PhosphorIcons from "@phosphor-icons/react";

interface IconRendererProps {
  icon: string;
  size?: number | string;
  color?: string;
  weight?: "regular" | "thin" | "light" | "bold" | "fill" | "duotone";
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  icon,
  size = 24,
  color = "currentColor",
  weight = "duotone", // Set our synchronized default to "duotone"
  className = "",
}) => {
  // If the icon name doesn't exist, fallback to 'Star' or 'Question'
  const IconComponent =
    (PhosphorIcons as any)[icon] || PhosphorIcons.Star;

  return (
    <IconComponent
      size={size}
      color={color}
      weight={weight}
      className={className}
    />
  );
};
