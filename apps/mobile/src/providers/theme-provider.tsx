import { VariableContextProvider } from "nativewind";

import { useThemeVariables } from "@/lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const theme = useThemeVariables();

	return (
		<VariableContextProvider value={theme}>
			{children}
		</VariableContextProvider>
	);
}
