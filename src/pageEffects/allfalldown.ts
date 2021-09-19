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

type GameObjectwithArcadeBody = Phaser.GameObjects.Image & Phaser.GameObjects.Rectangle & {
	body: Phaser.Physics.Arcade.Body
};

export class PageScene extends Phaser.Scene {
	backgroundRects: Phaser.GameObjects.Rectangle[] = []
	domImages: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = []
	bodiesToDo: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
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
		const rectsWithPhysics: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
		// add the images for web page elements to the scene as game objects 
		domElementImages.forEach((img) => {
			img.body.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setCollideWorldBounds(true).setAllowGravity(false)
			this.domImages.push(img)
		})
		backgroundRectangles.forEach((rect) => {
			rectsWithPhysics.push (this.physics.add.existing(rect) as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody )
		})

		this.bodiesToDo = [...domElementImages, ...rectsWithPhysics]
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

