import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects } from '../modhelper'

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = {	active: true,	key: `PageScene`}

export function doPageEffect(pageInfo: PageInfo) {
	const pageScene = new PageScene(pageInfo)
	pageInfo.game.scene.add(mySceneConfig.key, pageScene)
	return pageScene
}
const speedChangeDelta = 2000
const speedAdjustmentFactor = .6

export class PageScene extends Phaser.Scene {
	bodiesToDo: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
	timeBetweenFalls = 500
	timeSinceLastFall = 0
	time2 = 0

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
		if (!this.bodiesToDo.length)
			return
		this.timeSinceLastFall += delta
		this.time2 += delta
		if (this.time2 > speedChangeDelta) {
			this.timeBetweenFalls*= speedAdjustmentFactor
			this.time2 = 0
		}
		if (this.timeSinceLastFall > this.timeBetweenFalls) {
			this.timeSinceLastFall = 0
			const i = getRandomInt(this.bodiesToDo.length)
			log(`moving body ${i}`)
			const x =  getRandomInt(200) - 100
			const y =  300 + getRandomInt(500) 
			this.bodiesToDo[i].body.setVelocity(x, y).setDamping(false).setDragY(500).setAllowGravity(true)
			this.bodiesToDo.splice(i, 1)
		}
	}
}