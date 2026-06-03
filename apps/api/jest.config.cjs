/** @type {import('jest').Config} */
const config = {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	maxWorkers: 1,
	extensionsToTreatAsEsm: [".ts"],
	collectCoverageFrom: [
		"src/routers/**/*.ts",
		"src/trpc/**/*.ts",
		"!src/**/*.d.ts",
		"!src/index.ts",
	],
	coverageThreshold: {
		global: {
			lines: 80,
			functions: 80,
			branches: 70,
			statements: 80,
		},
	},
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	moduleNameMapper: {
		"^@mobiliza/realtime$": "<rootDir>/src/__tests__/mocks/realtime.ts",
		"^@/(.*)$": "<rootDir>/src/$1",
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	testPathIgnorePatterns: ["/node_modules/", "/dist/"],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.test.json",
				useESM: true,
			},
		],
	},
	transformIgnorePatterns: ["node_modules/(?!(@t3-oss|better-auth)/)"],
	verbose: true,
};

module.exports = config;
