import { useEffect, useRef, useState } from "react";

import { getRealtimeClient } from "@/lib/realtime";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentTripPosition {
	id: string;
	latitude: number;
	longitude: number;
	heading?: number;
}

interface UseStudentTripPositionOptions {
	/** Whether the subscription is active */
	enabled: boolean;

	/** The active request ID to subscribe to */
	requestId?: string | null;

	/** Event name for position updates on the request channel */
	positionEvent?: string;
}

interface UseStudentTripPositionResult {
	/** The student's current real-time position */
	studentPosition: StudentTripPosition | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Subscribe to the student's position updates during a trip (scholar side).
 *
 * Listens to the `request:{requestId}` channel for position events
 * broadcast by the student who is being served.
 */
export function useStudentTripPosition({
	enabled,
	requestId,
	positionEvent = "student:position",
}: UseStudentTripPositionOptions): UseStudentTripPositionResult {
	const [studentPosition, setStudentPosition] =
		useState<StudentTripPosition | null>(null);

	const channelRef = useRef<string | null>(null);

	useEffect(() => {
		if (!enabled || !requestId) {
			setStudentPosition(null);
			return;
		}

		const channel = `request:${requestId}`;
		channelRef.current = channel;
		let cancelled = false;

		const setup = async () => {
			const client = await getRealtimeClient();
			if (cancelled) return;

			const unsubPosition = client.subscribe(
				channel,
				positionEvent,
				(data: unknown) => {
					if (cancelled) return;

					const payload = data as {
						studentId: string;
						latitude: number;
						longitude: number;
						heading?: number;
					};

					setStudentPosition({
						id: payload.studentId,
						latitude: payload.latitude,
						longitude: payload.longitude,
						heading: payload.heading,
					});
				},
			);

			return () => {
				unsubPosition();
			};
		};

		const cleanupPromise = setup();

		return () => {
			cancelled = true;
			cleanupPromise.then((cleanup) => cleanup?.());
		};
	}, [enabled, requestId, positionEvent]);

	return { studentPosition };
}
