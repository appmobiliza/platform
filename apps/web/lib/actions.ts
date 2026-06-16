"use server";

import { revalidateTag } from "next/cache";

export async function revalidateScholarDashboard() {
	revalidateTag("scholar-dashboard", { expire: 0 });
}
