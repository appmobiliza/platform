"use client";

import * as React from "react";

import type { ServiceEntry } from "@/components/services-data";

type Listener = () => void;

let selectedEntry: ServiceEntry | null = null;
const listeners = new Set<Listener>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export function openServiceDetails(entry: ServiceEntry) {
	selectedEntry = entry;
	emitChange();
}

export function closeServiceDetails() {
	selectedEntry = null;
	emitChange();
}

function subscribe(listener: Listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function useServiceDetailsEntry() {
	return React.useSyncExternalStore(
		subscribe,
		() => selectedEntry,
		() => null,
	);
}
