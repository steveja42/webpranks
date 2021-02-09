import React, { useState, useEffect } from 'react'
import { log } from './util'

/**
 *  a hook that returns dimensions of the window to components, updating when the window is resized
 * 
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useWindowDimensions() {
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return windowDimensions;
}

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height
	};
}

export const useMousePosition = (win) => {
	const [position, setPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const setFromEvent = (e) => setPosition({ x: e.clientX, y: e.clientY });
		win?.addEventListener("mousemove", setFromEvent);
		const x = win?.frameElement
		//log(`addevent ${x}`)
		return () => {
			win?.removeEventListener("mousemove", setFromEvent);
		};
	}, [win]);

	return position;
};