/** @type {import('next').NextConfig} */
const nextConfig = {
	cacheComponents: true,
	experimental: {
		staleTimes: {
			dynamic: 120,
			static: 300,
		},
	},
	async rewrites() {
		if (process.env.NODE_ENV === 'development') {
			return [{
				source: '/api/:path*',
				destination: 'http://localhost:3001/api/:path*',
			}];
		}
		return [{
			source: '/api/:path*',
			destination: 'https://api-appmobiliza.vercel.app/api/:path*',
		}];
	},
};

export default nextConfig;
