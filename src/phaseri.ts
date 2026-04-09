import * as Phaser from 'phaser';
import { PageInfo } from "./domtoobjects"
import { setBackgroundAndCreateDomObjects } from './modhelper'
import { log, ll } from './util'



let gameLoadedPromise: Promise<Phaser.Game>
let resolveGameLoadedCallback: ((game: Phaser.Game) => void) | undefined

export function setupWorld(parentElement: HTMLElement, width: number, height: number): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		parent: parentElement,
		width: width,
		height: height,
		physics: {
			default: 'arcade',
			arcade: {
				gravity: { x: 0, y: 300 },
				//debug: true
			},
			matter: {
				//debug: true,
				gravity: { x: 0, y: 0.5 }
			}
		},
		callbacks: { postBoot: onPostBoot },
		scene: undefined, // { key: "rootScene", visible: false },
		//	backgroundColor: 0xfff8ff  //0xfff8dc  //'cornsilk',

	};
	gameLoadedPromise = new Promise<Phaser.Game>(resolve => {

		resolveGameLoadedCallback = resolve
	})

	const game = new Phaser.Game(config);

	return game

}
let prevPage: PageInfo | undefined
let prevScene: Phaser.Scene | undefined

export function setCurrentScene(scene: Phaser.Scene | undefined) {
	prevScene = scene
}

export function resetPhaseri() {
	prevPage = undefined
	prevScene = undefined
}

function onPostBoot(game: Phaser.Game) {
	log(ll.info, `-----------phaser game booting done`)
	resolveGameLoadedCallback!(game)
}

export async function resetAndLoadImagesForNewPageScene(pageInfo: PageInfo): Promise<PageInfo> {
	if (!pageInfo.game) {
		pageInfo.game = await gameLoadedPromise
	}
	log(ll.debug, `----prevPage=${!!prevPage} prevScene=${!!prevScene}--------------------`)
	if (prevScene) {
		log(ll.info, `stopping scene ${prevScene.scene.key}`)
		prevScene.scene.stop()
		prevScene.scene.remove()
		prevScene = undefined
	}
	if (prevPage) {
		const textureKeys = Object.keys(pageInfo.game!.textures.list)
		log(ll.debug, `textures before cleanup (${textureKeys.length}): ${textureKeys.join(', ')}`)
		// Guard: remove any lingering PageScene even if prevScene was already cleared
		const sceneKeys = ['PageScene']
		for (const key of sceneKeys) {
			if (pageInfo.game!.scene.getScene(key)) {
				log(ll.info, `removing lingering scene ${key}`)
				pageInfo.game!.scene.remove(key)
			}
		}
		// Collect keys first, then remove — avoids mutating the list while iterating.
		const keysToRemove: string[] = []
		pageInfo.game!.textures.each((texture) => {
			if (! /^__/.test(texture.key))
				keysToRemove.push(texture.key)
		}, {})
		log(ll.debug, `removing textures: ${keysToRemove.join(', ')}`)
		keysToRemove.forEach(key => pageInfo.game!.textures.remove(key))
	}

	prevPage = pageInfo
	log(ll.info, `loading textures`)
	if (pageInfo.domElementsImages.length)
		await loadTextures(pageInfo.game!, pageInfo.domElementsImages.map((value) => value.imageURL))
	else
		log(ll.warn, `wierd, no domElementsImages, not loading textures`)
	//gs = new PageScene(page, nextSceneName)
	//game.scene.add(nextSceneName, gs)
	return pageInfo
}

export async function loadTextures(game: Phaser.Game, imageURLs: string[], baseName = "dom") {
	let imagesYetToLoadCount = imageURLs.length
	const regex = new RegExp(`^${baseName}\\d+`)
	const texturesLoaded = new Promise(resolve => {
		game.textures.on('addtexture', (key: string) => {
			if (regex.test(key)) {  // ensure key is one we added
				const tex = game.textures.get(key)
				const glTex = tex?.source?.[0]?.glTexture
				log(ll.trace, `addtexture: ${key} glTexture=${!!glTex} source=${!!tex?.source?.[0]}`)
				if (--imagesYetToLoadCount === 0) {
					game.textures.off('addtexture')
					log(ll.info, `-----------texture loading done`)
					resolve(key)
				}
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
	private square!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

	constructor(public page: PageInfo, readonly name: string) {
		super(mySceneConfig);
	}

	public preload() {
		log(ll.info, `start`)
	}

	public create() {
		log(ll.info, 'creating scene')
		setBackgroundAndCreateDomObjects(this, this.page)

		this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as Phaser.GameObjects.Rectangle  & { body: Phaser.Physics.Arcade.Body };
		this.physics.add.existing(this.square);
	}

	public update() {
		const cursorKeys = this.input.keyboard!.createCursorKeys();

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
