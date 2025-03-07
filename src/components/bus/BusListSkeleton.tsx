
import { Skeleton } from "@/components/ui/skeleton";

export const BusListSkeleton = () => {
  return (
    <div className="flex justify-center py-4">
      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
};
