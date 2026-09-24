import { Heart } from 'lucide-react';
import { useFavorites } from '@/features/favorites';
import { PageHead } from '@/layouts/AccountLayout';
import { RestaurantCard, RestaurantCardSkeleton } from '@/components/RestaurantCard';
import { EmptyState } from '@/ui/bits';
import { LinkButton } from '@/ui/Button';
import type { Restaurant } from '@/lib/types';

export default function Favorites() {
  const { list, loading } = useFavorites();
  return (
    <div>
      <PageHead eyebrow="Saved" title="Favourites" lead="Places you want to come back to. Tap the heart on any restaurant to save it." />
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : !list.length ? (
        <EmptyState icon={<Heart className="size-6" />} title="No favourites yet" body="Save restaurants you like and they'll wait for you here." action={<LinkButton to="/restaurants">Discover restaurants</LinkButton>} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {(list as Restaurant[]).map((r, i) => (
            <RestaurantCard key={r._id} restaurant={r} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
