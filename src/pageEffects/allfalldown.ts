import { Engine, Render, Bodies, World, Body } from "matter-js"
import { PageGraphics } from '../domtoobjects'
import { log } from '../util'
import { CollisionCategory } from '../phaseri'
import { center, ms, getRandomInt, displayDomObjects,PrankSceneI } from '../modhelper'

export function doPageEffect(pageGraphics: PageGraphics) {

	const sceneName = `PageScene`
	mySceneConfig.key = sceneName

	const pageScene = new PageScene(pageGraphics, sceneName)
	pageGraphics.game.scene.add(sceneName, pageScene)
	return pageScene
}

//world.gravity.y = 1
	/*const width = render.canvas.width
	const height = render.canvas.height
	const groundHeight = 10
	const ground = Bodies.rectangle(center(0, width), center(height - groundHeight, height), width, groundHeight, {
		isStatic: true,
		render: { fillStyle: "blue" },
		collisionFilter: {
			mask: CollisionCategory.ground | CollisionCategory.movingDom,
			category: CollisionCategory.ground
		}
	});

	World.add(world, [ground]);
	await ms(2000)
	const bodiesToDo = bodies.map((value, index) => index)
	while (bodiesToDo.length) {
		const i = getRandomInt(bodiesToDo.length)
		log (`moving body ${bodiesToDo[i]}`)
		const body = bodies[bodiesToDo[i]]
		body.collisionFilter.category = CollisionCategory.movingDom
		body.collisionFilter.mask = CollisionCategory.ground | CollisionCategory.movingDom
		Body.setVelocity(body, { x: 0, y: 10 })
		bodiesToDo.splice(i, 1)
		await ms(1000)
	}
	*/

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: true,
	visible: true,
	key: `PageScene`
};

export class PageScene extends Phaser.Scene implements PrankSceneI {
	private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
	backgroundRects:Phaser.GameObjects.Rectangle[] =[]
	domImages:Phaser.GameObjects.Image [] = []

	constructor(public page: PageGraphics, readonly name: string) {
		super(mySceneConfig);
	}

	public preload() {
		log(`start`)
	}

	public create() {
		log('creating scene')
		if (this.page.bgColor)
			this.cameras.main.setBackgroundColor(this.page.bgColor)
		for (const backgroundRect of this.page.backgroundRects) {
			//const url = URL.createObjectURL(domElement.imageURL)
			const rect = this.add.rectangle(center(backgroundRect.boundingRect.x, backgroundRect.boundingRect.right), center(backgroundRect.boundingRect.y, backgroundRect.boundingRect.bottom), backgroundRect.boundingRect.width, backgroundRect.boundingRect.height, backgroundRect.bgColor)
			this.backgroundRects.push(rect)
		}
		this.page.domElementsImages.forEach((domElement, i) => {
			const img = this.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.top), `dom${i}`
			)
			this.domImages.push(img)
		})


		this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as any;
		this.physics.add.existing(this.square)
		this.physics.add.group(this.domImages)
		// player.setBounce(0.2);
		//player.setCollideWorldBounds(true);
	}

	public update() {
		const cursorKeys = this.input.keyboard.createCursorKeys();

		if (cursorKeys.up.isDown) {
			this.square.body.setVelocityY(-500);
		} else if (cursorKeys.down.isDown) {
			this.square.body.setVelocityY(500);
		} else {
			this.square.body.setVelocityY(0);
		}

		if (cursorKeys.right.isDown) {
			this.square.body.setVelocityX(500);
		} else if (cursorKeys.left.isDown) {
			this.square.body.setVelocityX(-500);
		} else {
			this.square.body.setVelocityX(0);
		}
	}
}