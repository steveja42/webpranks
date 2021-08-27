import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects, ms, CollisionCategory, CollisonGroup } from '../modhelper'

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

type GameObjectwithMatterBody = Phaser.GameObjects.Image & Phaser.GameObjects.Rectangle & {
	body: MatterJS.BodyType
};


export class PageScene extends Phaser.Scene {
	backgroundRects: GameObjectwithMatterBody[] = []
	domImages: Phaser.Physics.Matter.Image[] = []
	deltaElapsed = 0
	lastTime = 0
	fulcrum: GameObjectwithMatterBody
	wreckingBall: GameObjectwithMatterBody
	chain: GameObjectwithMatterBody[] = []

	constructor(public pageInfo: PageInfo) {
		super(mySceneConfig);
		log('constructing scene')
	}

	public preload() {
		log(`start`)
		//this.load.image('block', 'assets/sprites/block.png');
		this.load.image('chainlink', 'assets/chainlink32.png');
	}

	public async create() {
		log('creating scene')
		const { width, height } = this.sys.game.canvas
		//this.matter.world.setBounds(0, 0, width, height);
		this.matter.add.mouseSpring({})
		const { backgroundRectangles, domMatterElementImages: domElementImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo, false, true)

		backgroundRectangles.forEach(rect => {
			this.backgroundRects.push(this.matter.add.gameObject(rect, {
				ignoreGravity: true, collisionFilter: {
					group: CollisonGroup.Dom,
					mask: CollisionCategory.ground | CollisionCategory.movingDom | CollisionCategory.default,
					category: CollisionCategory.dom
				}
			}) as GameObjectwithMatterBody)
		});

		this.domImages = domElementImages

		const groundHeight = 10
		const wallWidth = 10
		const ground = this.add.rectangle(center(0, width), center(height - groundHeight, height), width, groundHeight, 0x0000ff)
		this.matter.add.gameObject(ground, {
			isStatic: true,
			render: { fillColor: 0x0000ff },
			collisionFilter: {
				group: 1,
				mask: CollisionCategory.default | CollisionCategory.ground | CollisionCategory.dom | CollisionCategory.domBackground | CollisionCategory.movingDom,
				category: CollisionCategory.ground
			}
		});

		//await ms(2000)

		let x = width / 2
		const y = 10
		const MetalDensity = .1
		const wreckingballRadius = width / 18
		const fulcrumRadius = 10
		const chainlinkRadius = 16

		this.fulcrum = this.matter.add.gameObject(this.add.rectangle(x, y, fulcrumRadius * 2, fulcrumRadius * 2, 0x000000), {
			isStatic: true, density: 0.04, frictionAir: 0.005, ignoreGravity: true, render: { fillColor: 0xfff },
			collisionFilter: {
				group: 2,
				mask: CollisionCategory.default | CollisionCategory.ground | CollisionCategory.dom | CollisionCategory.domBackground,
				category: CollisionCategory.default
			}
		}) as GameObjectwithMatterBody
		this.chain.push(this.fulcrum)
		let prevRadius = fulcrumRadius
		let prev = this.fulcrum.body
		for (let i = 0; i < 6; i++) {
			x -= prevRadius + chainlinkRadius
			const chainLink = this.matter.add.image(x, y, 'chainlink', null, {
				density: MetalDensity, collisionFilter: {
					group: CollisonGroup.Dom,
					category: CollisionCategory.none
				}
			}) as unknown as GameObjectwithMatterBody
			this.matter.add.joint(prev, chainLink.body, undefined, 1) //(i === 0) ? 90 : 35, 0.4);
			this.chain.push(chainLink)
			prev = chainLink.body
			prevRadius = chainlinkRadius
		}
		x -= prevRadius + wreckingballRadius

		this.wreckingBall = this.matter.add.gameObject(this.add.circle(x, y, wreckingballRadius, 0x000000), {
			density: MetalDensity, friction: 0, frictionAir: 0, render: { fillColor: 0x000000 },
			collisionFilter: {
				group: 2,
				mask: CollisionCategory.default | CollisionCategory.ground | CollisionCategory.dom | CollisionCategory.domBackground,
				category: CollisionCategory.default
			}
		}) as GameObjectwithMatterBody

		const con = this.matter.add.constraint(prev, this.wreckingBall.body, undefined, 1)//,40,.4) wreckingballWidth / 2 + 16
		this.chain.push(this.wreckingBall)

	}

	public update(time: number, delta: number) {
		this.deltaElapsed += delta
		if (this.chain.length) {
			for (let i = 1; i < this.chain.length - 1; i++) {
				let angle = Phaser.Math.Angle.BetweenPoints(this.chain[i - 1].body.position, this.chain[i].body.position)
				angle = Phaser.Math.RadToDeg(angle) - 90
				this.chain[i].setAngle(angle)
			}
		}
		if (this.deltaElapsed - this.lastTime > 500) {
			this.lastTime = this.deltaElapsed
			log(this.wreckingBall.body.velocity)
			log(`${Math.abs(this.wreckingBall.body.velocity.x) + Math.abs(this.wreckingBall.body.velocity.y)} `)
		}
		if (Math.abs(this.wreckingBall.body.velocity.x) + Math.abs(this.wreckingBall.body.velocity.y) < 2) {
			this.matter.applyForceFromAngle(this.wreckingBall.body, 4)
			log("woosh")
		}
	}

}

