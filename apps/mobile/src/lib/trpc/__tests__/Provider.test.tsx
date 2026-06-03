import React from "react";
import { render } from "@testing-library/react-native";
import { TRPCProvider } from "../Provider";
import { Text } from "react-native";
import { trpc } from "../client";
import { splitLink, wsLink, httpBatchLink } from "@trpc/client";

jest.mock("@trpc/client", () => ({
  httpBatchLink: jest.fn(() => "mock-http-link"),
  wsLink: jest.fn(() => "mock-ws-link"),
  splitLink: jest.fn((config) => "mock-split-link"),
  createWSClient: jest.fn(() => "mock-ws-client"),
}));

jest.mock("../client", () => ({
  trpc: {
    createClient: jest.fn(() => ({})),
    Provider: ({ children }: any) => <>{children}</>
  }
}));

describe("TRPCProvider Configuration", () => {
  it("should configure splitLink with wsLink for subscriptions", () => {
    // Arrange
    const TestComponent = () => <Text>Test</Text>;

    // Act
    render(
      <TRPCProvider>
        <TestComponent />
      </TRPCProvider>
    );

    // Assert
    expect(trpc.createClient).toHaveBeenCalled();
    const config = (trpc.createClient as jest.Mock).mock.calls[0][0];
    
    // Deve ter chamado o splitLink no factory dos links
    expect(splitLink).toHaveBeenCalled();
    
    const splitLinkArgs = (splitLink as jest.Mock).mock.calls[0][0];
    expect(splitLinkArgs.condition).toBeDefined(); // Deve ter uma function condition
    expect(splitLinkArgs.true).toBe("mock-ws-link");
    expect(splitLinkArgs.false).toBe("mock-http-link");
    
    // E o wsLink deve ter sido configurado com a porta do WebSocket
    expect(wsLink).toHaveBeenCalled();
  });
});
