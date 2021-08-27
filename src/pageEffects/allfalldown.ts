import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects } from '../modhelper'

export function doPageEffect(page: PageInfo) {
	const pageScene = new PageScene(page)
	page.game.scene.add(mySceneConfig.key, pageScene)
	return pageScene
}

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: true,
	visible: true,
	key: `PageScene`
};

export class PageScene extends Phaser.Scene {
	backgroundRects: Phaser.GameObjects.Rectangle[] = []
	domImages: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = []
	bodiesToDo: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = []
	removeDelta = 500
	deltaElapsed = 0

	constructor(public pageInfo: PageInfo) {
		super(mySceneConfig);
		log('constructing scene')
	}

	public preload() {
		log(`start`)
	}

	public create() {
		log('creating scene')
		const { backgroundRectangles, domArcadeElementImages:domElementImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo)

		// add the images for web page elements to the scene as game objects 
		domElementImages.forEach((img) => {
			img.body.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setCollideWorldBounds(true).setAllowGravity(false)
			this.domImages.push(img)
		})


		this.bodiesToDo = [...this.domImages]
	}

	public update(time: number, delta: number) {
		this.deltaElapsed += delta

		if (this.bodiesToDo.length && this.deltaElapsed > this.removeDelta) {
			this.deltaElapsed = 0
			const i = getRandomInt(this.bodiesToDo.length)
			log(`moving body ${i}`)
			this.bodiesToDo[i].setVelocity(0, 500).setDamping(false).setDragY(500).body.setAllowGravity(true)
			this.bodiesToDo.splice(i, 1)
		}

	}

}

