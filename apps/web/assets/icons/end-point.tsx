import type * as React from "react";

const EndPoint: React.FC<React.SVGProps<SVGElement>> = (_props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="23"
		height="27"
		fill="none"
		viewBox="0 0 23 27"
	>
		<title>Ponto de chegada</title>
		<path fill="#005E65" d="M0 3.997h22.5v21.477H0z"></path>
		<path
			fill="#fff"
			d="M13.368 9.478a6.75 6.75 0 1 1-4.237 0l-4.13-7.29h12.5z"
		></path>
		<path
			fill="#005E65"
			d="M18 15.889a6.75 6.75 0 0 0-4.632-6.411l4.132-7.29H5l4.131 7.29A6.75 6.75 0 1 0 18 15.889m1.25 0A8 8 0 1 1 7.364 8.894L2.855.938h16.79l-4.51 7.957a8 8 0 0 1 4.115 6.994"
		></path>
	</svg>
);

export default EndPoint;
