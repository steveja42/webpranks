const baseModules = [
	{ title: "Wrecking Ball", fileName: 'wreckingball', slug: 'wrecking-ball' },
	{ title: "All Fall Down", fileName: 'allfalldown', slug: 'all-fall-down' },
	{ title: "Happy Birthday", fileName: 'birthday', slug: 'happy-birthday' },
	{ title: "BTC Invaders", fileName: 'btcinvaders/scenes/btcinvaders', slug: 'btc-invaders' },
	{ title: "Dino Rampage", fileName: 'godzilla', slug: 'dino-rampage' },
	//{ title: "Space Invaders", fileName: 'btcinvaders/scenes/spaceinvaders' },
]

export const debugModule = { title: "Debug (Drag)", fileName: 'debug', slug: 'debug' }

// effectModules always includes debug so it can be loaded by slug/index;
// the UI filters it out unless isDebugMode() is true.
export const effectModules = [...baseModules, debugModule]
