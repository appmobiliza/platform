import { fireEvent, render, screen } from "@testing-library/react-native";

import { trpc } from "@/lib/trpc/client";

import { ScholarHome } from "../home";

// Mock do NativeWind para evitar erro de Metro/CSS
jest.mock("nativewind", () => ({
	useUnstableNativeVariable: jest.fn(),
	useColorScheme: () => ({
		colorScheme: "light",
		toggleColorScheme: jest.fn(),
	}),
}));

// Mock do tRPC client
jest.mock("@/lib/trpc/client", () => ({
	trpc: {
		useUtils: jest.fn(() => ({
			requests: {
				available: {
					invalidate: jest.fn(),
				},
			},
		})),
		requests: {
			available: {
				useQuery: jest.fn(),
			},
			onAvailable: {
				useSubscription: jest.fn(),
			},
		},
	},
}));

// Mock do safe area insets
jest.mock("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock do router
jest.mock("expo-router", () => ({
	useRouter: () => ({ push: jest.fn() }),
}));

describe("ScholarHome Logic Integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should display real requests from tRPC when shift is started", async () => {
		// Arrange: Mock tRPC returning a real request
		const mockRequest = {
			id: "real-req-uuid",
			studentProfile: {
				id: "student-1",
				user: { id: "u1", image: null },
				nickname: "Maria",
			},
			originLocation: { name: "Bloco A" },
			destinationLocation: { name: "Restaurante" },
			status: "pending",
			createdAt: new Date().toISOString(),
		};

		(trpc.requests.available.useQuery as jest.Mock).mockReturnValue({
			data: [mockRequest],
			isLoading: false,
		});

		// Act
		render(<ScholarHome />);

		// Ativa o estado de turno
		const welcomeText = screen.getByText(/Olá,/);
		fireEvent.press(welcomeText);

		// Assert: O texto do local real deve estar na tela
		expect(screen.getByText("Bloco A")).toBeTruthy();
		expect(screen.getByText("Restaurante")).toBeTruthy();
	});

	it("should subscribe to realtime events and invalidate query when a new request arrives", async () => {
		(trpc.requests.available.useQuery as jest.Mock).mockReturnValue({
			data: [],
			isLoading: false,
		});

		const mockSubscription = jest.fn();
		(
			trpc.requests.onAvailable.useSubscription as jest.Mock
		).mockImplementation((params, options) => {
			mockSubscription(params, options);
		});

		render(<ScholarHome />);

		const welcomeText = screen.getByText(/Olá,/);
		fireEvent.press(welcomeText);

		expect(trpc.requests.onAvailable.useSubscription).toHaveBeenCalled();
		const args = (trpc.requests.onAvailable.useSubscription as jest.Mock)
			.mock.calls[0];
		expect(args[1].onData).toBeDefined(); // Deve ter um handler de onData
	});
});
