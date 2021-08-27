import { Engine, Render, Bodies, World, Body, Composite, Constraint, MouseConstraint } from "matter-js"
import { PageInfo, log, center, getRandomInt ,CollisionCategory} from '../modhelper'

export function doPageEffect(page: PageInfo) {
	const pageScene = new PageScene(page)
	page.game.scene.add(mySceneConfig.key, pageScene)
	return pageScene
}

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: true,
	visible: true,
	key: `PageScene`,
	physics: {
		default: 'matter',
		matter: {
			debug: false,
			gravity: { x: 0, y: 1 }
		}
	}

}

export class PageScene extends Phaser.Scene {
	backgroundRects: MatterJS.BodyType[] = []
	domImages: Phaser.Physics.Matter.Image[] = []
	deltaElapsed = 0
	fulcrum: MatterJS.BodyType
	wreckingBall: MatterJS.BodyType

	constructor(public page: PageInfo) {
		super(mySceneConfig);
		log('constructing scene')
	}

	public preload() {
		log(`start`)

	}

	public create() {
		log('creating scene')
		const { width, height } = this.sys.game.canvas
		const groundHeight = 30

		const ground = this.matter.add.rectangle(center(0, width), center(height - groundHeight, height), width, groundHeight, {
			isStatic: true,
			render: { fillColor: 0x0000ff },
			collisionFilter: {
				group: 1,
				mask: CollisionCategory.ground | CollisionCategory.movingDom,
				category: CollisionCategory.ground
			}
		});
		const x = 30
		const y = 0
		const color = 0x0000ff
		this.matter.add.rectangle(10,10, 30, 30, { render: { fillColor: 0x0000ff, lineColor:0xff0000 } })
		
		this.matter.add.rectangle(10,50, 30, 30, {render: { fillColor: 0x0000ff, fillOpacity:1, lineColor:0x00ff00 } })
		this.matter.add.rectangle(10,100, 30, 30, {ignoreGravity:true, render: { fillColor: 0x0000ff, fillOpacity:1, lineColor:0x0000ff } })
			

		const rect = this.add.rectangle(100,100,40,40,0xff0000);
this.matter.add.gameObject(rect, {ignoreGravity:true})

	}
}