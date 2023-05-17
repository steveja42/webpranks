import { PageInfo, log, setBackgroundAndCreateDomObjects, CollisionCategory, CollisonGroup } from '../modhelper'

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
			debug: true,
			gravity: { x: 0, y: 1 }
		}
	}

}

type GameObjectwithMatterBody = Phaser.GameObjects.Image & Phaser.GameObjects.Rectangle & {
	body: MatterJS.BodyType
};
export class PageScene extends Phaser.Scene {
	backgroundRects: GameObjectwithMatterBody[] = []
	
	constructor(public pageInfo: PageInfo) {
		super(mySceneConfig);
		log('constructing scene')
	}

	public preload() {
		log(`start`)
		
	}

	public async create() {
		
		log('creating scene')
		const domDensity = .1
		const domRestitution = 0
//		this.matter.world.setBounds(0, 0, width, height, 5, false, false, false, false)
		this.matter.add.mouseSpring({})

	const { domBackgroundRects: backgroundRectangles } = setBackgroundAndCreateDomObjects(this, this.pageInfo, false, true)
	
		backgroundRectangles.forEach(rect => {
			this.backgroundRects.push(this.matter.add.gameObject(rect, {
				ignoreGravity: true, density: domDensity, restitution: domRestitution, collisionFilter: {
					group: CollisonGroup.Dom,
					mask: CollisionCategory.ground | CollisionCategory.movingDom | CollisionCategory.default,
					category: CollisionCategory.dom
				}
			}) as GameObjectwithMatterBody)
		});

	}

}



