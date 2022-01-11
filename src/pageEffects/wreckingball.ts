import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects, ms, CollisionCategory, CollisonGroup, GameObjectwithMatterBody, breakUp } from '../modhelper'

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

let cursors
const domDensity = .1
const domRestitution = 0
const domMatterOptions = {
	ignoreGravity: true, density: domDensity, restitution: domRestitution, collisionFilter: {
		group: CollisonGroup.Dom,
		mask: CollisionCategory.ground | CollisionCategory.movingDom | CollisionCategory.default,
		category: CollisionCategory.dom
	}
}

let	ballId = 0

export class PageScene extends Phaser.Scene {
	deltaElapsed = 0
	lastTime = 0
	lastInitialMovement = 0
	fulcrum: GameObjectwithMatterBody
	wreckingBall: GameObjectwithMatterBody
	chain: GameObjectwithMatterBody[] = []
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
		log('creating scene')
		const { width, height } = this.sys.game.canvas
		const maxAreaForObjects = width * height / 3
		this.matter.world.setBounds(0, 0, width, height, 5, false, false, false, false)
		this.matter.add.mouseSpring({})
		cursors = this.input.keyboard.createCursorKeys();

		const { domBackgroundRects: backgroundRectangles, domMatterImages: domElementImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo, false, true)
		backgroundRectangles.forEach(rect => {
			if ((rect.width * rect.height) < maxAreaForObjects) {
				this.matter.add.gameObject(rect, domMatterOptions) 
			}
		});
		domElementImages.forEach(di => {
			di.setDensity(domDensity)
			di.setBounce(domRestitution)
		})

		this.addTheGround(width, height)

		const wreckingballRadius = width / 18
		const x = width / 2
		const y = - wreckingballRadius
		const chainLength = height / 2
		this.addBallAndChain(x, y, wreckingballRadius, chainLength)
		//this.matter.world.engine.timing.timeScale = .6  //inital swing of ball is in slow motion
	}

/**
 * Called when the wrecking ball collides with a matter object
 * 
 * @param data 
 */

	onCollide(data: Phaser.Types.Physics.Matter.MatterCollisionData) {
		const TimeBetweenCollisions = 1500
		log(`${data.bodyA.id} collided with ${data.bodyB.id} - ${ballId}`)
		const scene = data.bodyA.gameObject.scene
		const time = Date.now()
		const collidee:GameObjectwithMatterBody = (data.bodyA.id === ballId)?data.bodyB.gameObject : data.bodyA.gameObject
		if (collidee?.data?.values?.collisionTime && time - collidee.data.values.collisionTime < TimeBetweenCollisions)
			return
		const snafu: any = data
		const newlyCreatedObjects = breakUp(snafu.activeContacts[0].vertex.x, snafu.activeContacts[0].vertex.y, collidee) //   data.collision.normal, data.bodyA.bounds.min,data.bodyA.bounds.max)
		if (newlyCreatedObjects) {
			const x= collidee.x + collidee.width /2
			const y= collidee.y + collidee.height/2
			newlyCreatedObjects.forEach((newGameObject) => {
				newGameObject.setData("collisionTime",time)
				const foo:GameObjectwithMatterBody = scene.matter.add.gameObject(newGameObject, domMatterOptions)
				let speed = scene.wreckingBall.body.speed
				if (scene.wreckingBall.x > foo.x)
					speed = -speed
				foo.body.ignoreGravity = false
				//scene.matter.applyForce(foo, scene.wreckingBall.body.velocity)
				//scene.matter.applyForceFromPosition(foo, {x,y}, speed) //,Phaser.Math.Angle.Between(x,y,foo.x, foo.y))
			})
		}
		collidee.destroy()
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

	/**
	 * 
	 * @param x 
	 * @param y 
	 * @param wreckingballRadius 
	 * @param chainLength 
	 */
	addBallAndChain(x, y, wreckingballRadius, chainLength) {
		const MetalDensity = 5
		const fulcrumRadius = 10
		const chainlinkRadius = 16
		const numLinks = (chainLength - fulcrumRadius - wreckingballRadius) / (chainlinkRadius * 2)

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
		let prevObject = this.fulcrum.body
		for (let i = 0; i < numLinks; i++) {
			x -= prevRadius + chainlinkRadius
			const chainLink = this.matter.add.image(x, y, 'chainlink', null, {
				density: MetalDensity, collisionFilter: {
					group: CollisonGroup.Dom,
					category: CollisionCategory.none
				}
			}) as unknown as GameObjectwithMatterBody
			this.matter.add.joint(prevObject, chainLink.body, undefined, 1) //(i === 0) ? 90 : 35, 0.4);
			this.chain.push(chainLink)
			prevObject = chainLink.body
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
		ballId = this.wreckingBall.body.id
		const con = this.matter.add.constraint(prevObject, this.wreckingBall.body, undefined, 1)//,40,.4) wreckingballWidth / 2 + 16
		this.chain.push(this.wreckingBall)
		this.wreckingBall.body.onCollideCallback = this.onCollide
	}
/**
 * Move the fulcrum initially
 * @param duration 
 * @param totalDistance 
 * @param object 
 */
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

	addTheGround(width, height) {
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



