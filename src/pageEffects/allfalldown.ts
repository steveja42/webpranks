import { PageInfo, log, center, getRandomInt} from '../modhelper'

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
	private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
	backgroundRects: Phaser.GameObjects.Rectangle[] = []
	domImages: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = []
	bodiesToDo: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = []
	removeDelta = 1000
	deltaElapsed = 0
	foo: Phaser.Physics.Arcade.Image

	constructor(public page: PageInfo) {
		super(mySceneConfig);
		log('constructing scene')
	}

	public preload() {
		log(`start`)
	}

	public create() {
		log('creating scene')
		//set background color of scene to match that of the web page
		if (this.page.bgColor)
			this.cameras.main.setBackgroundColor(this.page.bgColor)
		//add rectangles to the scene to match the web page elements that had different background colors than the whole page 	
		for (const backgroundRect of this.page.backgroundRects) {
			//const url = URL.createObjectURL(domElement.imageURL)
			const rect = this.add.rectangle(center(backgroundRect.boundingRect.x, backgroundRect.boundingRect.right), center(backgroundRect.boundingRect.y, backgroundRect.boundingRect.bottom), backgroundRect.boundingRect.width, backgroundRect.boundingRect.height, backgroundRect.bgColor)
			this.backgroundRects.push(rect)
		}
		// add the images for web page elements to the scene as game objects 
		this.page.domElementsImages.forEach((domElement, i) => {
			const img = this.physics.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.top), `dom${i}`)

			img.body.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setCollideWorldBounds(true).setAllowGravity(false)
			this.domImages.push(img)
		})

		this.bodiesToDo = [...this.domImages]
		this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as any;
		this.physics.add.existing(this.square)
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

