/** @type {import('next').NextConfig} */
const nextConfig = {
	cacheComponents: true,
	experimental: {
		staleTimes: {
			dynamic: 120,
			static: 300,
		},
	},
};

export default nextConfig;
