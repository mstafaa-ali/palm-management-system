import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tractor, ChevronRight, Home } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <div className="flex items-center gap-1">
          <Home className="w-4 h-4" /> Home
        </div>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 font-medium">Farm Management</span>
      </div>

      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-palm-dark flex items-center gap-3">
            <Tractor className="w-8 h-8 text-palm-primary" />
            <Skeleton className="h-8 w-64" />
          </h1>
          <div className="mt-2">
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
