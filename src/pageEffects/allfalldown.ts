import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects } from '../modhelper'

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = { active: true, key: `PageScene` }

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
	falls=0
	fallingSound

	constructor(public pageInfo: PageInfo) {
		super(mySceneConfig);
	}

	public preload() {
		log(`preload`)
		this.load.audio("falling", ['assets/audio/fallingwhistle2.ogg', 'assets/audio/fallingwhistle2.mp3'], {
			instances: 5
		})
	}

	public create() {
		this.fallingSound = this.sound.add("falling")
		const { domArcadeBackgroundRects, domArcadeImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo)
		this.bodiesToDo = [...domArcadeImages, ...domArcadeBackgroundRects]
		this.bodiesToDo.forEach((object) => {
			object.body.setBounceY(Phaser.Math.FloatBetween(0.4, .6)).setCollideWorldBounds(true).setAllowGravity(false)
			object.setInteractive()
			this.input.setDraggable(object)
		})
		this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

			gameObject.x = dragX;
			gameObject.y = dragY;

		});
	}

	public update(time: number, delta: number) {
		if (!this.bodiesToDo.length)
			return
		this.timeSinceLastFall += delta
		this.time2 += delta
		if (this.time2 > speedChangeDelta) {
			this.timeBetweenFalls *= speedAdjustmentFactor
			this.time2 = 0
		}
		if (this.timeSinceLastFall > this.timeBetweenFalls) {
			this.timeSinceLastFall = 0
			const i = getRandomInt(this.bodiesToDo.length)
			log(`moving body ${i}`)
			this.falls++
			const x = getRandomInt(200) - 100
			const y = 300 + getRandomInt(500)
			//if (this.falls < 5)
				this.sound.play('falling')
			//this.fallingSound.play()
			this.bodiesToDo[i].body.setVelocity(x, y).setDamping(false).setAllowGravity(true).setGravityY(100)  //.setDragY(500)
			this.bodiesToDo.splice(i, 1)
		}
	}
}