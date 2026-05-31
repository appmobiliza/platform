import Svg, { Mask, Path, type SvgProps } from "react-native-svg";

const FromMarker = (props: SvgProps) => (
	<Svg viewBox="0 0 18 22" fill="none" {...props}>
		<Path fill="var(--primary)" d="M0 3.659h18v18H0z" />
		<Mask
			id="a"
			width={13}
			height={21}
			x={2.6}
			y={-0.941}
			fill="#000"
			maskUnits="userSpaceOnUse"
		>
			<Path fill="#fff" d="M2.6-.941h13v21h-13z" />
			<Path d="M13.213 9.645a5.4 5.4 0 1 1-8.428-.001L9 2.06l4.213 7.586Z" />
		</Mask>
		<Path
			fill="#fff"
			d="M13.213 9.645a5.4 5.4 0 1 1-8.428-.001L9 2.06l4.213 7.586Z"
		/>
		<Path
			fill="var(--primary)"
			d="m13.213 9.645-.874.486.041.074.053.066.78-.626ZM14.4 13.02h1-1ZM9 18.42v1-1Zm-5.4-5.4h-1 1Zm1.186-3.376.78.626.053-.066.04-.074-.873-.486ZM9 2.06l.875-.485L9 0l-.875 1.574.874.485Zm4.213 7.586-.78.626c.605.754.967 1.708.967 2.75h2a6.378 6.378 0 0 0-1.407-4.001l-.78.625ZM14.4 13.02h-1a4.4 4.4 0 0 1-4.4 4.4v2a6.4 6.4 0 0 0 6.4-6.4h-1ZM9 18.42v-1a4.4 4.4 0 0 1-4.4-4.4h-2a6.4 6.4 0 0 0 6.4 6.4v-1Zm-5.4-5.4h1c0-1.041.361-1.996.966-2.75l-.78-.626-.78-.625A6.378 6.378 0 0 0 2.6 13.02h1Zm1.186-3.376.874.486 4.214-7.585L9 2.06l-.874-.485-4.215 7.585.875.485ZM9 2.06l-.874.486 4.213 7.586.874-.486.875-.485-4.213-7.586L9 2.059Z"
			mask="url(#a)"
		/>
	</Svg>
);

const ToMarker = (props: SvgProps) => (
	<Svg viewBox="0 0 18 22" fill="none" {...props}>
		<Path fill="var(--primary)" d="M0 3.35h18v18H0z" />
		<Path
			fill="#fff"
			d="M10.695 7.582a5.4 5.4 0 1 1-3.39 0L4 1.75h10l-3.305 5.832Z"
		/>
		<Path
			fill="var(--primary)"
			d="M14.4 12.71a5.403 5.403 0 0 0-3.705-5.128L14 1.75H4l3.305 5.832a5.4 5.4 0 1 0 7.095 5.129Zm1 0A6.4 6.4 0 1 1 5.89 7.116L2.285.75h13.431l-3.608 6.366a6.397 6.397 0 0 1 3.292 5.595Z"
		/>
	</Svg>
);

export { FromMarker, ToMarker };
