import { Skeleton } from "@/components/ui/skeleton";

export function TaskSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-card border-b border-border/50 last:border-0 rounded-lg">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[150px]" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-md" />
                </div>
            ))}
        </div>
    );
}
