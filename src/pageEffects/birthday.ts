import FormCheckLabel from 'react-bootstrap/esm/FormCheckLabel'
import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects } from '../modhelper'

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = { active: true, key: `PageScene`, physics: { arcade: { debug: false } } }

export function doPageEffect(pageInfo: PageInfo) {
	const pageScene = new PageScene(pageInfo)
	pageInfo.game.scene.add(mySceneConfig.key, pageScene)
	return pageScene
}

export class PageScene extends Phaser.Scene {
	bodiesToDo: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
	removeDelta = 500
	timeElapsed = 0
	pageObjects: Phaser.GameObjects.Group
	lastMovement = 0
	index = 0
	width
	height
	constructor(public pageInfo: PageInfo) {
		super(mySceneConfig);
	}

	public preload() {
		this.load.image('red', 'assets/particles/red.png')
		this.load.atlas('flares', 'assets/particles/flares.png', 'assets/particles/flares.json')
		this.load.image('fire', 'assets/particles/muzzleflash3.png')
		this.load.image('cake', 'assets/birthday-cake.png')
		this.load.image('candle', 'assets/candle.jpg')
		this.load.audio("song", ["assets/audio/happy-birthday-rock.mp3", "assets/audio/happy-birthday-rock.ogg"])
	}

	public create() {
		this.sound.play("song", { loop: true })

		const { domBackgroundRects, domImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo, false)
		this.pageObjects = this.add.group().addMultiple(domBackgroundRects).addMultiple(domImages)

		const cake = this.makeCake()
		//cake.setVelocity(100, 200)
		this.addMessage("Happy Birthday")

		

	}

	private moveObjects(time: number) {
		const { width, height } = this.sys.game.canvas
		const MoveInterval = 300
		const XMove = width / 8
		const YMove = height / 8
		const angleChange = 10
		const xIncs = [-XMove, XMove, XMove, -XMove]
		const yIncs = [YMove, -YMove, YMove, -YMove]
		const angles = [-angleChange, angleChange, angleChange, -angleChange]
		//		const yIncs = [-YMove, YMove, -YMove, YMove]
		if (time - this.lastMovement < MoveInterval)
			return
		this.lastMovement = time
		this.pageObjects.incX(xIncs[this.index])
		this.pageObjects.incY(yIncs[this.index])
		this.pageObjects.angle(angles[this.index])
		this.index = (this.index + 1) % xIncs.length

	}

	public update(time: number, delta: number) {

		this.moveObjects(time)
	}

	private makeCake() {
		const { width, height } = this.sys.game.canvas
		const objects: Phaser.GameObjects.GameObject[] = []
		let x = width / 2 -175
		let y = height *2 / 3
		objects.push(this.add.image(x, y, "cake").setOrigin(0, 0))//.setBounce(1,1).setCollideWorldBounds(true))
		x += 155
		y -= 30
		objects.push(this.makeCandle(x, y))
		x += 40
		objects.push(this.makeCandle(x, y))
		x += 30
		y += 20
		objects.push(this.makeCandle(x, y))
		return this.add.group().addMultiple(objects)  //{collideWorldBounds:true,bounceX:1, bounceY:1}
	}

	private makeCandle(x, y) {
		const candle = this.add.image(x, y, "candle").setScale(.1, .1)
		y -= 53
		this.add.particles('fire').createEmitter({
			alpha: { start: 1, end: 0 },
			scale: { start: 0.1, end: .25 },
			//tint: { start: 0xff945e, end: 0xff945e },
			speed: 20,
			accelerationY: -100,
			angle: { min: -85, max: -95 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 300, max: 400 },
			blendMode: 'NORMAL',
			frequency: 110,
			//maxParticles: 10,
			x,
			y,
		}).startFollow(candle, 0, -53)
		return candle
	}

	private addMessage(message){
		const emitConfig = { speed: 20, scale: { start: .1, end: .4 }, blendMode: 'NORMAL', lifespan: { min: 300, max: 500 }	}
		const particleManager = this.add.particles('red')
		

		const text = this.add.text(400, 100, message, {
			fontFamily: 'Quicksand',
			fontSize: '48px',
			color: '#F8E71C',
			fontStyle: 'normal',
			stroke: '#000000',
			strokeThickness: 3,
			shadow: { fill: true, offsetY: null, offsetX: null, stroke: false }
		})
		const zmessage = this.physics.add.existing(text) as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody


		particleManager.createEmitter(emitConfig).startFollow(zmessage)
		particleManager.createEmitter(emitConfig).startFollow(zmessage, text.width)
		particleManager.createEmitter(emitConfig).startFollow(zmessage, text.width, text.height)
		particleManager.createEmitter(emitConfig).startFollow(zmessage,  0, text.height)

		zmessage.body.setVelocity(100, 200).setBounce(1, 1).setCollideWorldBounds(true);

	}
}

