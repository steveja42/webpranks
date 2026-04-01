export enum Phase {
	targetUrlNotEntered,
	targetUrlEntered,
	startPrankAfterMouseOrKeyPress,
	startingPrank,
	prankRunning,
	prankPaused,
	error
}

// Mutable global — io handlers read this directly
export const phaseState = { current: Phase.targetUrlNotEntered }

export const PhaseNext = "next"
export const PhaseTogglePause = "togglepause"
