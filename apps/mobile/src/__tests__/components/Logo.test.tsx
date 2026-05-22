import React from "react";

import { render } from "@testing-library/react-native";

import { Logo } from "@/assets/logo";

describe("Logo Component", () => {
	describe("Rendering", () => {
		it("renders without crashing", () => {
			const { toJSON } = render(<Logo />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders with testID prop without crashing", () => {
			const { toJSON } = render(<Logo testID="logo" />);
			expect(toJSON()).toBeTruthy();
		});
	});

	describe("Sizes", () => {
		it("renders small size (sm)", () => {
			const { toJSON } = render(<Logo size="sm" />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders medium size (md)", () => {
			const { toJSON } = render(<Logo size="md" />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders large size (lg) - default", () => {
			const { toJSON } = render(<Logo size="lg" />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders extra-large size (xl)", () => {
			const { toJSON } = render(<Logo size="xl" />);
			expect(toJSON()).toBeTruthy();
		});
	});

	describe("Theme", () => {
		it("renders with light theme (light={true})", () => {
			const { toJSON } = render(<Logo light />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders with dark theme (light={false})", () => {
			const { toJSON } = render(<Logo light={false} />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders with default theme (light=undefined)", () => {
			const { toJSON } = render(<Logo />);
			expect(toJSON()).toBeTruthy();
		});
	});

	describe("Combined Props", () => {
		it("renders small size with light theme", () => {
			const { toJSON } = render(<Logo size="sm" light />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders medium size with light theme", () => {
			const { toJSON } = render(<Logo size="md" light />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders large size with dark theme", () => {
			const { toJSON } = render(<Logo size="lg" light={false} />);
			expect(toJSON()).toBeTruthy();
		});

		it("renders extra-large size with dark theme", () => {
			const { toJSON } = render(<Logo size="xl" light={false} />);
			expect(toJSON()).toBeTruthy();
		});
	});
});
