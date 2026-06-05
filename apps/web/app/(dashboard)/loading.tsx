import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
	return (
		<section className="min-w-0 flex-1">
			<header className="border-b border-border p-4 md:p-6 flex flex-col items-start gap-1 justify-between bg-card">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-4 w-56 mt-1" />
			</header>
			<div className="p-4 flex flex-col gap-4 md:p-6">
				<Skeleton className="h-12 w-full rounded-lg" />

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="rounded-xl border p-4 space-y-3"
						>
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-16" />
							<Skeleton className="h-3 w-36" />
						</div>
					))}
				</div>

				<div className="flex flex-col lg:flex-row gap-4">
					{Array.from({ length: 2 }).map((_, i) => (
						<div
							key={i}
							className="flex-1 rounded-xl border p-4 space-y-3"
						>
							<Skeleton className="h-5 w-40" />
							{Array.from({ length: 3 }).map((_, j) => (
								<div
									key={j}
									className="flex items-center gap-3"
								>
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1 space-y-1.5">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-20" />
									</div>
									<Skeleton className="h-5 w-20 rounded-full" />
								</div>
							))}
						</div>
					))}
				</div>

				<Skeleton className="h-10 w-full rounded-xl" />
			</div>
		</section>
	);
}
