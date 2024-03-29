
/* adapted from github.com/trungk18/space-invaders-phaser-3*/
import { PageInfo, setBackgroundAndCreateDomObjects } from '../../../modhelper'
import { PageObject, explode } from '../../../arcadepageobject'

import { AssetType, SoundType } from "../interface/assets";
import { Bullet } from "../interface/bullet";
import { AssetManager } from "../interface/manager/asset-manager";
import { Ship } from "../interface/ship";
import {
    AnimationFactory,
    AnimationType,
} from "../interface/factory/animation-factory";
import { Kaboom } from "../interface/kaboom";
import { ScoreManager } from "../interface/manager/score-manager";
import { GameState } from "../interface/game-state";

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = { active: true, key: `PageScene`, physics: { arcade: { debug: false } } }
export function doPageEffect(pageInfo: PageInfo) {
    const pageScene = new MainScene(pageInfo)
    pageInfo.game.scene.add(mySceneConfig.key, pageScene)
    return pageScene
}

export class MainScene extends Phaser.Scene {
    state: GameState;
    assetManager: AssetManager;
    animationFactory: AnimationFactory;
    scoreManager: ScoreManager;
    bulletTime = 0;
    firingTimer = 0;
    player: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    fireKey: Phaser.Input.Keyboard.Key;
    pageObjects: Phaser.GameObjects.Group

    constructor(public pageInfo: PageInfo) {
        super(mySceneConfig);
    }

    preload() {
        this.load.setBaseURL("assets/spaceinvaders");
        this.load.image(AssetType.Bullet, "/images/bitcoin36.png");
        this.load.image(AssetType.Ship, "/images/player.png");
        this.load.spritesheet(AssetType.Kaboom, "/images/explode.png", {
            frameWidth: 128,
            frameHeight: 128,
        });

        this.sound.volume = 0.5;
        this.load.audio(SoundType.Shoot, "/audio/shoot.wav");
        this.load.audio(SoundType.Kaboom, "/audio/explosion.wav");
        this.load.audio(SoundType.InvaderKilled, "/audio/invaderkilled.wav");
    }

    create() {
        this.physics.world.gravity = new Phaser.Math.Vector2(0, 0)
        this.state = GameState.Playing;
        this.assetManager = new AssetManager(this);
        this.animationFactory = new AnimationFactory(this);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.player = Ship.create(this);
        this.scoreManager = new ScoreManager(this);

        this.fireKey.on("down", () => {
            switch (this.state) {
                case GameState.Win:
                case GameState.GameOver:
                    this.restart();
                    break;
            }
        })
        const { domArcadeBackgroundRects, domArcadeImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo)
       
        this.pageObjects = this.physics.add.group().addMultiple(domArcadeBackgroundRects).addMultiple(domArcadeImages)
        this.player.setDepth(1)
    }

    update() {
        this._shipKeyboardHandler();
        this.physics.overlap(
            this.assetManager.bullets,
            this.pageObjects,
            this._bulletHitPageObject,
            null,
            this
        );

    }

    private _shipKeyboardHandler() {
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setVelocity(0, 0);
        if (this.cursors.left.isDown) {
            playerBody.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            playerBody.setVelocityX(200);
        }
        if (this.cursors.up.isDown) {
            playerBody.setVelocityY(-200);
        } else if (this.cursors.down.isDown) {
            playerBody.setVelocityY(200);
        }

        if (this.fireKey.isDown) {
            this._fireBullet();
        }
    }

    private _bulletHitPageObject(bullet: Bullet, pageObject: PageObject) {
        const explosion: Kaboom = this.assetManager.explosions.get();
        bullet.kill();
        // alien.kill(explosion);
        explosion.setX(bullet.x);
        explosion.setY(bullet.y);
        explosion.play(AnimationType.Kaboom)
        this.sound.play(SoundType.InvaderKilled)
        explode(bullet.x, bullet.y - bullet.height/2, pageObject, this.pageObjects)
        this.scoreManager.increaseScore();
        /* if (!this.alienManager.hasAliveAliens) {
             this.scoreManager.increaseScore(1000);
             this.scoreManager.setWinText();
             this.state = GameState.Win;
         } */
    }

    private _fireBullet() {
        if (!this.player.active) {
            return;
        }

        if (this.time.now > this.bulletTime) {
            const bullet: Bullet = this.assetManager.bullets.get();
            if (bullet) {
                bullet.shoot(this.player.x, this.player.y - 18);
                this.bulletTime = this.time.now + 200;
            }
        }
    }

    restart() {
        this.state = GameState.Playing;
        this.player.enableBody(true, this.player.x, this.player.y, true, true);
        this.scoreManager.resetLives();
        this.scoreManager.hideText();
        this.assetManager.reset();
    }
}
