import { VariableContextProvider } from "nativewind";

import { useUserRole } from "@/lib/auth-store";

// O tema do bolsista usa um tom de azul profundo
const scholarTheme = {
	"--primary": "#0A2540",
	"--accent-foreground": "#4B799F",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const role = useUserRole();
	const theme = role === "scholar" ? scholarTheme : {};

	return (
		<VariableContextProvider value={theme}>
			{children}
		</VariableContextProvider>
	);
}
