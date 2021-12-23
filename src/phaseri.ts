import * as Phaser from 'phaser';
import { PageInfo } from "./domtoobjects"
import { center, setBackgroundAndCreateDomObjects } from './modhelper'
import { log } from './util'
//import ShatterImagePlugin from 'phaser3-rex-plugins/plugins/shatterimage-plugin'

let gameLoadedPromise: Promise<Phaser.Game>
let resolveGameLoadedCallback

export function setupWorld(parentElement: HTMLElement, width, height, background = ''): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		//parent: parentElement,
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
		/*plugins: {
			global: [{
				key: 'rexShatterImage',
				plugin: ShatterImagePlugin,
				start: true
			}]
		},
		*/
		callbacks: { postBoot: onPostBoot },
		scene: null, // { key: "rootScene", visible: false },
		backgroundColor: 0xfff8ff  //0xfff8dc  //'cornsilk',

	};
	gameLoadedPromise = new Promise<Phaser.Game>(resolve => {

		resolveGameLoadedCallback = resolve
	})

	const game = new Phaser.Game(config);

	return game

}
let gs: PageScene
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
		for (let i = 0; i < prevPage.domElementsImages.length; i++) {
			pageInfo.game.textures.remove(`dom${i}`)
		}
		//
	}
	log(`loading textures`)
	let imagesYetToLoadCount = pageInfo.domElementsImages.length
	const texturesLoaded = new Promise(resolve => {
		pageInfo.game.textures.on('addtexture', (key: string, texture) => {
			if (--imagesYetToLoadCount === 0) {
				pageInfo.game.textures.off('addtexture')
				log(`-----------texture loading done`)
				resolve(key)
			}
		})
	})
	prevPage = pageInfo
	let i = 0
	for (const domElement of pageInfo.domElementsImages) {
		pageInfo.game.textures.addBase64(`dom${i++}`, domElement.imageURL)
	}
	await texturesLoaded
	//gs = new PageScene(page, nextSceneName)
	//game.scene.add(nextSceneName, gs)
	return pageInfo
}

export async function resetScene(modInfo: PageInfo, currentScene: Phaser.Scene) {
	//Runner.stop(modInfo.engine)
	currentScene.scene.restart()
}

export function allowMouseToMoveWorldObjects(modInfo: PageInfo) {

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