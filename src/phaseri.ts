import * as Phaser from 'phaser';
import { PageInfo } from "./domtoobjects"
import { setBackgroundAndCreateDomObjects } from './modhelper'
import { log } from './util'



let gameLoadedPromise: Promise<Phaser.Game>
let resolveGameLoadedCallback

export function setupWorld(parentElement: HTMLElement, width, height): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		parent: parentElement,
		width: width,
		height: height,
		physics: {
			default: 'arcade',
			arcade: {
				gravity: { y: 300 },
				//debug: true
			},
			matter: {
				debug: true,
				gravity: { y: 0.5 }
			}
		},
		callbacks: { postBoot: onPostBoot },
		scene: null, // { key: "rootScene", visible: false },
		//	backgroundColor: 0xfff8ff  //0xfff8dc  //'cornsilk',

	};
	gameLoadedPromise = new Promise<Phaser.Game>(resolve => {

		resolveGameLoadedCallback = resolve
	})

	const game = new Phaser.Game(config);

	return game

}
let prevPage: PageInfo

function onPostBoot(game: Phaser.Game) {
	log(`-----------phaser game booting done`)
	resolveGameLoadedCallback(game)
}

export async function resetAndLoadImagesForNewPageScene(pageInfo: PageInfo, currentScene: Phaser.Scene): Promise<PageInfo> {
	if (!pageInfo.game) {
		pageInfo.game = await gameLoadedPromise
	}
	if (prevPage) {
		log(`textures: ${Object.keys(pageInfo.game.textures.list).length - 3}`)
		if (currentScene)
			currentScene.scene.remove()	  //page.game.scene.remove(currentScene.name)
		pageInfo.game.textures.each((texture) => {
			if (! /^__/.test(texture.key))
				pageInfo.game.textures.remove(texture)  //remove all textures except the defaults, which start with __
		}, this)
	}

	prevPage = pageInfo
	log(`loading textures`)
	if (pageInfo.domElementsImages.length)
		await loadTextures(pageInfo.game, pageInfo.domElementsImages.map((value) => value.imageURL))
	else
		log(`wierd, no domElementsImages, not loading textures`)
	//gs = new PageScene(page, nextSceneName)
	//game.scene.add(nextSceneName, gs)
	return pageInfo
}

export async function loadTextures(game: Phaser.Game, imageURLs: string[], baseName = "dom") {
	let imagesYetToLoadCount = imageURLs.length
	const regex = new RegExp(`^${baseName}\\d+`)
	const texturesLoaded = new Promise(resolve => {
		game.textures.on('addtexture', (key: string) => {
			if (regex.test(key))  // ensure key is one we added
				if (--imagesYetToLoadCount === 0) {
					game.textures.off('addtexture')
					log(`-----------texture loading done`)
					resolve(key)
				}
		})
	})
	let i = 0
	for (const imageURL of imageURLs) {
		game.textures.addBase64(`${baseName}${i++}`, imageURL)
	}
	return texturesLoaded
}

export async function resetScene(modInfo: PageInfo, currentScene: Phaser.Scene) {
	//Runner.stop(modInfo.engine)
	currentScene.scene.restart()
}

export function allowMouseToMoveWorldObjects() {

	return 1
}

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: true,
	visible: true,
	key: `PageScene`
};

export class PageScene extends Phaser.Scene {
	private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

	constructor(public page: PageInfo, readonly name: string) {
		super(mySceneConfig);
	}

	public preload() {
		log(`start`)
	}

	public create() {
		log('creating scene')
		setBackgroundAndCreateDomObjects(this, this.page)

		this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as Phaser.GameObjects.Rectangle  & { body: Phaser.Physics.Arcade.Body };
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