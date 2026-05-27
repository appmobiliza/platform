"use client";

import * as React from "react";

type Listener = () => void;

export type DetailsState<T> = {
	isOpen: boolean;
	item: T | null;
};

export function createDetailsStore<T>() {
	const emptyState: DetailsState<T> = {
		isOpen: false,
		item: null,
	};
	let selectedItem: DetailsState<T> = {
		isOpen: false,
		item: null,
	};
	const listeners = new Set<Listener>();

	function emitChange() {
		for (const listener of listeners) {
			listener();
		}
	}

	function openDetails(item: T) {
		selectedItem = {
			isOpen: true,
			item,
		};
		emitChange();
	}

	function closeDetails() {
		selectedItem = {
			isOpen: false,
			item: selectedItem.item,
		};
		emitChange();
	}

	function subscribe(listener: Listener) {
		listeners.add(listener);
		return () => listeners.delete(listener);
	}

	function useDetailsState() {
		return React.useSyncExternalStore(
			subscribe,
			() => selectedItem,
			() => emptyState,
		);
	}

	return {
		closeDetails,
		openDetails,
		useDetailsState,
	};
}
