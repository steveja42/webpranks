import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects, ms, CollisionCategory, CollisonGroup } from '../modhelper'

export function doPageEffect(page: PageInfo) {
	const pageScene = new PageScene(page)
	page.game.scene.add(mySceneConfig.key, pageScene)
	return pageScene
}
//mdn Object.keys;
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
let cursors

export class PageScene extends Phaser.Scene {
	backgroundRects: GameObjectwithMatterBody[] = []
	domImages: Phaser.Physics.Matter.Image[] = []
	deltaElapsed = 0
	lastTime = 0
	lastInitialMovement = 0
	fulcrum: GameObjectwithMatterBody
	wreckingBall: GameObjectwithMatterBody
	chain: GameObjectwithMatterBody[] = []
	initY = 0
	distanceMoved = 0
	constructor(public pageInfo: PageInfo) {
		super(mySceneConfig);
		log('constructing scene')
	}

	public preload() {
		log(`start`)
		this.load.image('chainlink', 'assets/chainlink32.png');
	}

	public async create() {
		const domDensity = .1
		const domRestitution = 0
		log('creating scene')
		const { width, height } = this.sys.game.canvas
		const maxAreaForObjects = width * height / 3
		this.matter.world.setBounds(0, 0, width, height, 5, false, false, false, false)
		this.matter.add.mouseSpring({})
		cursors = this.input.keyboard.createCursorKeys();

		const { domBackgroundRects: backgroundRectangles, domMatterImages: domElementImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo, false, true)

		backgroundRectangles.forEach(rect => {
			if ((rect.width * rect.height) < maxAreaForObjects) {
				this.backgroundRects.push(this.matter.add.gameObject(rect, {
					ignoreGravity: true, density: domDensity, restitution: domRestitution, collisionFilter: {
						group: CollisonGroup.Dom,
						mask: CollisionCategory.ground | CollisionCategory.movingDom | CollisionCategory.default,
						category: CollisionCategory.dom
					}
				}) as GameObjectwithMatterBody)
			}
		});
		domElementImages.forEach(di => {
			di.setDensity(domDensity)
			di.setBounce(domRestitution)
		})
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
		const yNudge = 20
		const wreckingballRadius = width / 18
		let x = width / 2
		const y = - wreckingballRadius
		this.initY = y
		const MetalDensity = 5
		const fulcrumRadius = 10
		const chainlinkRadius = 16
		const numLinks = (height / 2 - fulcrumRadius - wreckingballRadius) / (chainlinkRadius * 2)
		const chainLength = fulcrumRadius + wreckingballRadius + ((chainlinkRadius * numLinks) * 2)

		// -------- create fulcrum --------
		this.fulcrum = this.matter.add.gameObject(this.add.rectangle(x, y, fulcrumRadius * 2, fulcrumRadius * 2, 0x000000), {
			/*isStatic: true,*/ density: 100000, frictionAir: 0.005, ignoreGravity: true, render: { fillColor: 0xfff },
			collisionFilter: {
				group: CollisonGroup.Dom,
				mask: CollisionCategory.default | CollisionCategory.ground | CollisionCategory.dom | CollisionCategory.domBackground,
				category: CollisionCategory.default
			}
		}) as GameObjectwithMatterBody
		// -------- create chain --------
		this.chain.push(this.fulcrum)
		let prevRadius = fulcrumRadius
		let prev = this.fulcrum.body
		for (let i = 0; i < numLinks; i++) {
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
		//----------- create ball --------
		this.wreckingBall = this.matter.add.gameObject(this.add.circle(x, y, wreckingballRadius, 0x000000), {
			density: MetalDensity, restitution: domRestitution, friction: 0, frictionAir: 0, render: { fillColor: 0x000000 },
			collisionFilter: {
				group: 2,
				mask: CollisionCategory.default | CollisionCategory.ground | CollisionCategory.dom | CollisionCategory.domBackground,
				category: CollisionCategory.default
			}
		}) as GameObjectwithMatterBody

		const con = this.matter.add.constraint(prev, this.wreckingBall.body, undefined, 1)//,40,.4) wreckingballWidth / 2 + 16
		this.chain.push(this.wreckingBall)
		this.wreckingBall.body.onCollideCallback = this.onCollide
		/*		const targetAngle = 30
				const startAngle = Phaser.Math.DegToRad(targetAngle)
				const y1 = chainLength * Math.sin(startAngle)
				const x1 = chainLength * Math.cos(startAngle)
				this.wreckingBall.setPosition(width / 2 - x1, y - y1)
				const force = 11510
				const forceAngle = Phaser.Math.DegToRad(0)
			//	this.matter.applyForce(this.wreckingBall.body, {x: Math.cos(startAngle) * force, y: Math.sin(startAngle) * force }) // .setVelocity(this.wreckingBall.body, -5,10)
			*/
		this.matter.world.engine.timing.timeScale = .6  //inital swing of ball is in slow motion
	}

	onCollide(data: Phaser.Types.Physics.Matter.MatterCollisionData) {
//		log(`collided with ${data.bodyA.id}`) //${data.bodyA.body.id}
	}

	public update(time: number, delta: number) {
		this.deltaElapsed += delta

		this.adjustChainLinksAngle()
		this.allowCursorMovement(this.fulcrum)
		if (this.deltaElapsed < 2000)
			this.initialMovement(1000, this.wreckingBall.width / 2 + 10, this.fulcrum)
		if (this.deltaElapsed > 5000)
			this.matter.world.engine.timing.timeScale = 1

	}

	initialMovement(duration, totalDistance, object) {
		const timeIncrement = 200
		if (this.distanceMoved < totalDistance && this.deltaElapsed - this.lastInitialMovement > timeIncrement) {
			const distance = totalDistance / (duration / timeIncrement)
			this.distanceMoved += distance
			object.setPosition(object.x, object.y + distance)
			this.lastInitialMovement = this.deltaElapsed
		}
	}

	keepBallMovingFast() {
		const ballAngle = Phaser.Math.RadToDeg(this.wreckingBall.body.angle)
		const ballSpeed = Math.abs(this.wreckingBall.body.velocity.x) + Math.abs(this.wreckingBall.body.velocity.y)
		if (this.deltaElapsed - this.lastTime > 100) {
			this.lastTime = this.deltaElapsed
			//log(`at angle ${ballAngle.toFixed(2)} (x ${this.wreckingBall.body.velocity.x.toFixed(2)} y ${this.wreckingBall.body.velocity.y.toFixed(2)} ) - ${ballSpeed.toFixed(2)} `)
		}
		if (ballAngle < 10 && ballAngle > .5 && this.wreckingBall.body.velocity.x < 8 && this.wreckingBall.body.velocity.x > 0) {
			this.matter.setVelocityX(this.wreckingBall.body, 10)  //applyForce(this.wreckingBall.body,{x:9, y:0})
			log("woosh")
		}
	}
	adjustChainLinksAngle() {
		if (this.chain.length) {
			for (let i = 1; i < this.chain.length; i++) {
				let angle = Phaser.Math.Angle.BetweenPoints(this.chain[i - 1].body.position, this.chain[i].body.position)
				angle = Phaser.Math.RadToDeg(angle) - 90
				this.chain[i].setAngle(angle)
			}
		}
	}
	allowCursorMovement(object) {
		const increment = 5
		if (cursors.left.isDown) {
			object.setPosition(object.x - increment, object.y);
		}
		else if (cursors.right.isDown) {
			object.setPosition(object.x + increment, object.y);
		}
		else {
			object.setVelocityX(0);
		}
		if (cursors.up.isDown) {
			object.setPosition(object.x, object.y - increment);
		}
		else if (cursors.down.isDown) {
			object.setPosition(object.x, object.y + increment);
		}
		else {
			object.setVelocityY(0);
		}

	}



}



