import { act, renderHook, waitFor } from "@testing-library/react-native";

import { trpc } from "@/lib/trpc/client";

import { useRequestFlow } from "../use-request-flow";

jest.mock("expo-router", () => ({
	useRouter: () => ({ back: jest.fn() }),
}));

// Mock do módulo de realtime — getRealtimeClient retorna um cliente mock
const mockClient = {
	subscribe: jest.fn(() => jest.fn()),
	disconnect: jest.fn(),
};

jest.mock("@/lib/realtime", () => ({
	getRealtimeClient: jest.fn(() => Promise.resolve(mockClient)),
	disconnectRealtime: jest.fn(),
}));

jest.mock("@/lib/request-store", () => ({
	getRequestState: jest.fn(() => ({
		activeRequestId: null,
		searchState: "idle",
		stage: "destination-selection",
		origin: null,
		destination: null,
		message: "",
		requestCreatedAt: null,
	})),
	setRequestState: jest.fn(),
	clearRequestState: jest.fn(),
	useRequestState: jest.fn(() => ({
		activeRequestId: null,
		searchState: "idle",
		stage: "destination-selection",
		origin: null,
		destination: null,
		message: "",
		requestCreatedAt: null,
	})),
}));

jest.mock("@/lib/request-notifications", () => ({
	showSearchingNotification: jest.fn(),
	showAcceptedNotification: jest.fn(),
	showUnattendedNotification: jest.fn(),
	cancelNotification: jest.fn(),
	cancelAllNotifications: jest.fn(),
}));

jest.mock("@/lib/trpc/client", () => ({
	trpc: {
		requests: {
			create: {
				useMutation: jest.fn(),
			},
			markUnattended: {
				useMutation: jest.fn(),
			},
			cancel: {
				useMutation: jest.fn(),
			},
			studentHistory: {
				useInfiniteQuery: jest.fn(() => ({
					data: { pages: [], pageParams: [] },
					isLoading: false,
				})),
			},
		},
		locations: {
			list: {
				useQuery: jest.fn(() => ({ data: [] })),
			},
		},
	},
}));

describe("useRequestFlow Logic Integration", () => {
	it("should transition to searching immediately and then create the request", async () => {
		const mockCreate = jest.fn().mockResolvedValue({ id: "real-req" });
		const mockMarkUnattended = jest.fn().mockResolvedValue({});
		const mockCancel = jest.fn().mockResolvedValue({});

		(trpc.requests.create.useMutation as jest.Mock).mockReturnValue({
			mutateAsync: mockCreate,
			isPending: false,
		});
		(trpc.requests.markUnattended.useMutation as jest.Mock).mockReturnValue(
			{
				mutateAsync: mockMarkUnattended,
			},
		);
		(trpc.requests.cancel.useMutation as jest.Mock).mockReturnValue({
			mutateAsync: mockCancel,
		});

		const { result } = renderHook(() => useRequestFlow());

		await act(async () => {
			await result.current.confirmRequest("origem_id", "destino_id");
		});

		expect(mockCreate).toHaveBeenCalledWith({
			originLocationId: "origem_id",
			destinationLocationId: "destino_id",
			notes: "",
		});

		// A transição para "searching" é imediata — activeStage só reflete
		// após handleDismiss ser chamado (simulado via refs mockadas)
		await act(async () => {
			result.current.handleDismiss("destination-selection");
		});

		await waitFor(() => {
			expect(result.current.activeRequestId).toBe("real-req");
			expect(result.current.activeStage).toBe("searching");
		});
	});
});
