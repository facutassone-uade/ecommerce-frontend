import { Skeleton } from "@/components/ui/skeleton";

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <Skeleton className="aspect-[4/3] rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="mt-4 h-16 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;
