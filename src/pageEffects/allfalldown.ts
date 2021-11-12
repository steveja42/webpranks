import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects } from '../modhelper'

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = {	active: true,	key: `PageScene`}

export function doPageEffect(pageInfo: PageInfo) {
	const pageScene = new PageScene(pageInfo)
	pageInfo.game.scene.add(mySceneConfig.key, pageScene)
	return pageScene
}

export class PageScene extends Phaser.Scene {
	bodiesToDo: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
	removeDelta = 500
	deltaElapsed = 0

	constructor(public pageInfo: PageInfo) {
		super(mySceneConfig);
	}

	public preload() {
		log(`preload`)
	}

	public create() {
		const { domArcadeBackgroundRects, domArcadeImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo)
		this.bodiesToDo = [...domArcadeImages, ...domArcadeBackgroundRects]
		this.bodiesToDo.forEach((object) => {
			object.body.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setCollideWorldBounds(true).setAllowGravity(false)
		})
	}

	public update(time: number, delta: number) {
		this.deltaElapsed += delta

		if (this.bodiesToDo.length && this.deltaElapsed > this.removeDelta) {
			this.deltaElapsed = 0
			const i = getRandomInt(this.bodiesToDo.length)
			log(`moving body ${i}`)
			this.bodiesToDo[i].body.setVelocity(0, 500).setDamping(false).setDragY(500).setAllowGravity(true)
			this.bodiesToDo.splice(i, 1)
		}
	}
}