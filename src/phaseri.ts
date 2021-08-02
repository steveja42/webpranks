import * as Phaser from 'phaser';
import { PageGraphics } from "./domtoobjects"
import { center, displayDomObjects, PrankSceneI } from './modhelper'
import { log } from './util'
export enum CollisionCategory {
	default = 1,
	ground = 2,
	domBackground = 4,
	dom = 8,
	movingDom = 16
}

export function setupWorld(parentElement: HTMLElement, width, height, background = ''): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		parent: parentElement,
		width: width,
		height: height,
		physics: {
			default: 'arcade',
			arcade: {
				gravity: { y: 300 },
				debug: true
			}
		},
		scene: null,
		backgroundColor: 0xfff8dc  //'cornsilk'
	};
	const game = new Phaser.Game(config);

	return game

}
let gs: PageScene
let prevPage: PageGraphics


export async function resetAndLoadImagesForNewPageScene(page: PageGraphics, currentScene: PrankSceneI): Promise<PageGraphics> {
	if (prevPage) {
		log(`textures: ${Object.keys(page.game.textures.list).length - 3}`)
		if (currentScene)
			page.game.scene.remove(currentScene.name)
		for (let i = 0; i < prevPage.domElementsImages.length; i++) {
			page.game.textures.remove(`dom${i}`)
		}
		//
	}
	const texturesLoaded = new Promise(resolve => {
		page.game.textures.on('addtexture',
			(key: string, texture) => {
				if (key === `dom${page.domElementsImages.length - 1}`) {
					page.game.textures.off('addtexture')
					resolve(key)
				}
			})
	})
	prevPage = page
	let i = 0
	for (const domElement of page.domElementsImages) {
		page.game.textures.addBase64(`dom${i++}`, domElement.imageURL)
	}
	await texturesLoaded
	const nextSceneName = `PageScene${++sceneNumber}-`
	mySceneConfig.key = nextSceneName

	//gs = new PageScene(page, nextSceneName)
	//game.scene.add(nextSceneName, gs)
	return page
}

export async function resetWorld(modInfo: PageGraphics) {
	//Runner.stop(modInfo.engine)
}

export function allowMouseToMoveWorldObjects(modInfo: PageGraphics) {

	return 1
}

let sceneNumber = 0

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: true,
	visible: true,
	key: `PageScene`
};

export class PageScene extends Phaser.Scene {
	private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

	constructor(public page: PageGraphics, readonly name: string) {
		super(mySceneConfig);
	}

	public preload() {
		log(`start`)
	}

	public create() {
		log('creating scene')
		displayDomObjects(this, this.page)

		this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as any;
		this.physics.add.existing(this.square);
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