import { useColorScheme } from "react-native";
import { VariableContextProvider } from "nativewind";
import { useUserRole } from "@/lib/auth-store";

// O tema do bolsista usa um tom de azul profundo
const scholarTheme = {
	light: {
		"--color-primary": "#0A2540", 
		"--color-primary-foreground": "#FFFFFF",
		"--color-sidebar-primary": "#0A2540",
		"--color-accent-foreground": "#0A2540",
	},
	dark: {
		"--color-primary": "#1A4C80", 
		"--color-primary-foreground": "#FFFFFF",
		"--color-sidebar-primary": "#1A4C80",
		"--color-accent-foreground": "#1A4C80",
	},
};

// O tema do aluno usa as variáveis padrão definidas no global.css
const studentTheme = {
	light: {},
	dark: {},
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const colorScheme = useColorScheme() ?? "light";
	const role = useUserRole();

	const themeVars = role === "scholar" ? scholarTheme[colorScheme] : studentTheme[colorScheme];

	return (
		<VariableContextProvider value={themeVars}>
			{children}
		</VariableContextProvider>
	);
}
