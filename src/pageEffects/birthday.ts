import { PageInfo, log, center, getRandomInt, setBackgroundAndCreateDomObjects } from '../modhelper'

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = { active: true, key: `PageScene`,physics :{arcade:{debug:false}}}

export function doPageEffect(pageInfo: PageInfo) {
	const pageScene = new PageScene(pageInfo)
	pageInfo.game.scene.add(mySceneConfig.key, pageScene)
	return pageScene
}

export class PageScene extends Phaser.Scene {
	bodiesToDo: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
	removeDelta = 500
	deltaElapsed = 0

	constructor(public pageInfo: PageInfo) {
		super(mySceneConfig);
	}

	public preload() {
		this.load.image('red', 'assets/particles/red.png')
		this.load.atlas('flares', 'assets/particles/flares.png', 'assets/particles/flares.json')
		this.load.image('fire', 'assets/particles/muzzleflash3.png')
		this.load.image('candle', 'assets/candle.jpg')
		this.load.audio("song", ["assets/audio/happy-birthday-rock.mp3", "assets/audio/happy-birthday-rock.ogg"])
	}

	public create() {
		this.sound.play("song",{loop:true})

		const { width, height } = this.sys.game.canvas
		const { domBackgroundRects, domImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo, false)
		let x = width/4
		const y = height/3
		const candle = this.add.image(x, y, "candle").setScale(.1,.1)
		this.makeFlame(x,y - 53)
		x*= 3
		this.add.image(x, y, "candle").setScale(.1,.1)
		this.makeFlame(x,y - 55)
		
		const emitter = this.add.particles('red').createEmitter({
			speed: 100,
			scale: { start: .1, end: .9 },
			blendMode: 'NORMAL'
		});

		const emitter2 = this.add.particles('red').createEmitter({
			speed: 100,
			scale: { start: .1, end: .9 },
			blendMode: 'NORMAL'
		});
		
		const text = this.add.text(400, 100, 'Happy Birthday!', {
			fontFamily: 'Quicksand',
			fontSize: '48px',
			color: '#F8E71C',
			fontStyle: 'normal',
			stroke: '#000000',
			strokeThickness: 3,
			shadow: { fill: true, offsetY: null, offsetX: null, stroke: false }
		})
		const message = this.physics.add.existing(text) as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody

		message.body.setVelocity(100, 200).setBounce(1, 1).setCollideWorldBounds(true);

		emitter.startFollow(message);
		emitter2.startFollow(message, text.width);

	}

	public update(time: number, delta: number) {
		this.deltaElapsed += delta

	}

	private makeFlame(x,y){
		return this.add.particles('fire').createEmitter({
			alpha: { start: 1, end: 0 },
			scale: { start: 0.5, end: 2.5 },
			//tint: { start: 0xff945e, end: 0xff945e },
			speed: 20,
			accelerationY: -300,
			angle: { min: -85, max: -95 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 1000, max: 1100 },
			blendMode: 'NORMAL',
			frequency: 110,
			//maxParticles: 10,
			x,
			y,
		})
	}
}

