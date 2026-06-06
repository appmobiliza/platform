import { render } from "@testing-library/react-native";
import { httpBatchLink } from "@trpc/client";
import { Text } from "react-native";

import { trpc } from "../client";
import { TRPCProvider } from "../Provider";

jest.mock("@trpc/client", () => ({
	httpBatchLink: jest.fn(() => "mock-http-link"),
}));

jest.mock("../client", () => ({
	trpc: {
		createClient: jest.fn(() => ({})),
		Provider: ({ children }: any) => <>{children}</>,
	},
}));

describe("TRPCProvider Configuration", () => {
	it("should configure httpBatchLink for all operations", () => {
		// Arrange
		const TestComponent = () => <Text>Test</Text>;

		// Act
		render(
			<TRPCProvider>
				<TestComponent />
			</TRPCProvider>,
		);

		// Assert
		expect(trpc.createClient).toHaveBeenCalled();
		const _config = (trpc.createClient as jest.Mock).mock.calls[0][0];

		// Deve ter passado o httpBatchLink na lista de links
		expect(httpBatchLink).toHaveBeenCalled();

		const httpBatchLinkArgs = (httpBatchLink as jest.Mock).mock.calls[0][0];
		expect(httpBatchLinkArgs.url).toContain("/trpc");
		expect(httpBatchLinkArgs.headers).toBeDefined();
	});
});
