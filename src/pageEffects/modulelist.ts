const baseModules = [
	{ title: "Wrecking Ball", fileName: 'wreckingball', slug: 'wrecking-ball' },
	{ title: "All Fall Down", fileName: 'allfalldown', slug: 'all-fall-down' },
	{ title: "Happy Birthday", fileName: 'birthday', slug: 'happy-birthday' },
	{ title: "BTC Invaders", fileName: 'btcinvaders/scenes/btcinvaders', slug: 'btc-invaders' },
	{ title: "Dino Rampage", fileName: 'godzilla', slug: 'dino-rampage' },
	//{ title: "Space Invaders", fileName: 'btcinvaders/scenes/spaceinvaders' },
]

const debugModules = import.meta.env.DEV
	? [{ title: "Debug (Drag)", fileName: 'debug', slug: 'debug' }]
	: []

export const effectModules = [...baseModules, ...debugModules]