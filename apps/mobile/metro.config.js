// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

// Enable package exports resolution for ESM packages with "exports" field
// Required for better-auth, @better-auth/core, @better-auth/utils, and other ESM packages
config.resolver.unstable_enablePackageExports = true;

// Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
	return (req, res, next) => {
		res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
		res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
		middleware(req, res, next);
	};
};

module.exports = withNativewind(config, { inlineRem: 16 });
