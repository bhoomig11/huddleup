import {
  Wifi,
  Shirt,
  Lock,
  Sofa,
  Car,
  Lightbulb,
  Sparkles,
  Heart,
  ShoppingBag,
  UtensilsCrossed,
  HandHeart,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

/**
 * Configuration mapping for turf feature icons.
 *
 * This file maps feature names (as stored in the database) to their corresponding
 * Lucide React icons. When a new feature is added to the database, you can add
 * its icon mapping here. Features without a mapping will use the default
 * CheckCircle2 icon.
 *
 * To add a new feature icon:
 * 1. Import the desired icon from 'lucide-react'
 * 2. Add an entry: "Feature Name": IconComponent
 *
 * The feature name must match exactly as it appears in the database.
 */
export const TURF_FEATURE_ICONS: Record<string, LucideIcon> = {
  "Free WiFi": Wifi,
  "Changing Rooms": Shirt,
  Lockers: Lock,
  Lounge: Sofa,
  Parking: Car,
  Lights: Lightbulb,
  "Spa/Sauna": Sparkles,
  "First Aid": Heart,
  "Pro Shop": ShoppingBag,
  Cafeteria: UtensilsCrossed,
  "Massage Parlor": HandHeart,
};

/**
 * Default icon to use when a feature doesn't have a specific icon mapping.
 */
export const DEFAULT_FEATURE_ICON: LucideIcon = CheckCircle2;

/**
 * Gets the icon for a feature name.
 * Returns the mapped icon if available, otherwise returns the default icon.
 *
 * @param featureName - The name of the feature as stored in the database
 * @returns The Lucide icon component for the feature
 */
export function getFeatureIcon(featureName: string): LucideIcon {
  return TURF_FEATURE_ICONS[featureName] ?? DEFAULT_FEATURE_ICON;
}
