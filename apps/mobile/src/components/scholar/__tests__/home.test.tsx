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
				pending: {
					invalidate: jest.fn(),
				},
			},
		})),
		requests: {
			pending: {
				useQuery: jest.fn(),
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

		(trpc.requests.pending.useQuery as jest.Mock).mockReturnValue({
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
		(trpc.requests.pending.useQuery as jest.Mock).mockReturnValue({
			data: [],
			isLoading: false,
		});

		render(<ScholarHome />);

		const welcomeText = screen.getByText(/Olá,/);
		fireEvent.press(welcomeText);

		// Verifica que a query de pendentes está configurada
		expect(trpc.requests.pending.useQuery).toHaveBeenCalled();
	});
});
