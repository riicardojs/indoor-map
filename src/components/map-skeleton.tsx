import { Skeleton } from "@/components/ui/skeleton";

export function MapSkeleton() {
  return (
    <div className="absolute inset-0 bg-[#33415f] p-6">
      <div className="mx-auto mt-4 max-w-md">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
      <div className="mx-auto mt-10 h-[60vh] max-w-4xl">
        <Skeleton className="h-full w-full rounded-3xl" />
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}
