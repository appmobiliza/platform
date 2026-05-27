"use client";

import type * as React from "react";

interface Props {
	children: React.ReactNode;
}

export function DetailsSidebar({ children }: Props) {
	return (
		<div className="w-75 border-l border-border">
			<p>testando</p>
			{children}
		</div>
	);
}
