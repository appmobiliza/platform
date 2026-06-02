/** @type {import('jest').Config} */
module.exports = {
	preset: "jest-expo",
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
	},
	transformIgnorePatterns: [
		"node_modules/(?!.*(react-native|@react-native|expo|@expo|@react-navigation|@sentry|native-base|nativewind|tailwindcss|@trpc|@tanstack|@rn-primitives|@mobiliza))",
	],
	moduleNameMapper: {
		// Aponta os assets para a raiz do mobile
		"^@/assets/(.*)$": "<rootDir>/assets/$1",

		// Mock simples para o Jest não quebrar ao tentar ler arquivos SVG/PNG
		"\\.(svg|png|jpg|jpeg|gif)$": "<rootDir>/src/__tests__/setup.ts",

		// Mantém o comportamento original para o resto do src
		"^@/(.*)$": "<rootDir>/src/$1",
	},
};
