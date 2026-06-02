import type * as React from "react";

const StartPoint: React.FC<React.SVGProps<SVGElement>> = (_props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="23"
		height="28"
		fill="none"
		viewBox="0 0 23 28"
	>
		<title>Ponto de partida</title>
		<path fill="#005E65" d="M0 4.536h22.5v22.5H0z"></path>
		<mask
			id="a"
			width="18"
			height="25"
			x="2.5"
			y="-0.465"
			fill="#000"
			maskUnits="userSpaceOnUse"
		>
			<path fill="#fff" d="M2.5-.465h18v25h-18z"></path>
			<path d="M17.5 13.565h-.05a6.75 6.75 0 1 1-12.4 0H5l6.25-11.03z"></path>
		</mask>
		<path
			fill="#fff"
			d="M17.5 13.565h-.05a6.75 6.75 0 1 1-12.4 0H5l6.25-11.03z"
		></path>
		<path
			fill="#005E65"
			d="M17.5 13.565v1.25h2.145l-1.058-1.867zm-.05 0v-1.25h-1.901l.753 1.745zm.549 2.67h1.25zm-6.749 6.752v1.25zM4.5 16.236H3.25zm.55-2.671 1.148.495.752-1.745h-1.9zm-.05 0-1.088-.617-1.057 1.867H5zm6.25-11.03 1.088-.616L11.25 0l-1.088 1.92zm6.25 11.03v-1.25h-.05v2.5h.05zm-.05 0-1.148.495c.287.666.447 1.4.447 2.176h2.5a8 8 0 0 0-.652-3.166zm.549 2.67h-1.25a5.5 5.5 0 0 1-5.5 5.502l.001 1.25v1.25a8 8 0 0 0 7.999-8.001zm-6.749 6.752v-1.25a5.5 5.5 0 0 1-5.5-5.501h-2.5a8 8 0 0 0 8 8zM4.5 16.236h1.25c0-.775.16-1.51.448-2.176l-1.148-.495-1.148-.495a8 8 0 0 0-.652 3.165zm.55-2.671v-1.25H5v2.5h.05zm-.05 0 1.088.616 6.25-11.03-1.088-.616-1.088-.616-6.25 11.03zm6.25-11.03-1.088.617 6.25 11.029 1.088-.616 1.087-.617-6.25-11.029z"
			mask="url(#a)"
		></path>
	</svg>
);

export default StartPoint;
