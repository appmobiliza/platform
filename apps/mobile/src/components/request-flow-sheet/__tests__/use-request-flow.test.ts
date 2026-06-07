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

jest.mock("@/lib/trpc/client", () => ({
	trpc: {
		requests: {
			create: {
				useMutation: jest.fn(),
			},
		},
	},
}));

describe("useRequestFlow Logic Integration", () => {
	it("should call trpc.requests.create when transitioning to searching", async () => {
		const mockMutateAsync = jest.fn().mockResolvedValue({ id: "real-req" });

		(trpc.requests.create.useMutation as jest.Mock).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false,
		});

		const { result } = renderHook(() => useRequestFlow());

		await act(async () => {
			await result.current.confirmRequest("origem_id", "destino_id");
		});

		expect(mockMutateAsync).toHaveBeenCalledWith({
			originLocationId: "origem_id",
			destinationLocationId: "destino_id",
			notes: "",
		});

		// O state não atualiza imediatamente após `confirmRequest` porque
		// ele depende da re-renderização (isPending/mutateAsync). Em testes de hook,
		// force uma re-renderização ou espere pelo próximo frame caso haja batched updates.
		await act(async () => {
			result.current.handleDismiss("destination-selection");
		});

		// Agora o state visual "activeStage" deve estar refletindo a fila
		await waitFor(() => {
			expect(result.current.activeRequestId).toBe("real-req");
			expect(result.current.activeStage).toBe("searching");
		});
	});
});
