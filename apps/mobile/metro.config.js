const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [
	"web.ts",
	"web.tsx",
	...config.resolver.sourceExts.filter(
		(ext) => ext !== "web.ts" && ext !== "web.tsx",
	),
];

module.exports = withNativewind(config, { inlineRem: 16 });
