import type { TurfFeature } from "~/types/turf";
import { getFeatureIcon } from "~/config/turf-feature-icons";

type Props = {
  features: Array<TurfFeature>;
};

/**
 * Component to display turf features with icons and descriptions.
 * Features are displayed in a single card with a responsive grid layout.
 */
export function TurfFeatureGrid({ features }: Props) {
  if (features.length === 0) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.featureName} feature={feature} />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: TurfFeature }) {
  const Icon = getFeatureIcon(feature.featureName);
  return (
    <div key={feature.featureName} className="flex flex-row items-start gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-green-700" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-stone-600">
          {feature.featureName}
        </span>
        {feature.featureDescription && (
          <span className="text-xs leading-relaxed text-stone-500">
            {feature.featureDescription}
          </span>
        )}
      </div>
    </div>
  );
}
