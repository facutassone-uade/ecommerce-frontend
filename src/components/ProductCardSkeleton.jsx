import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <CardContent className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

export default ProductCardSkeleton;
