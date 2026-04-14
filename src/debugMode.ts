let _debugMode = import.meta.env.DEV

export function isDebugMode() {
	return _debugMode
}

export function enableDebugMode() {
	_debugMode = true
	window.dispatchEvent(new CustomEvent('debugmode:enabled'))
}
