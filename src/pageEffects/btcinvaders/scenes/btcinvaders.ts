
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
    pageInfo.game!.scene.add(mySceneConfig.key!, pageScene)
    return pageScene
}

export class MainScene extends Phaser.Scene {
    state!: GameState;
    assetManager!: AssetManager;
    animationFactory!: AnimationFactory;
    scoreManager!: ScoreManager;
    bulletTime = 0;
    firingTimer = 0;
    player!: Phaser.Physics.Arcade.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    fireKey!: Phaser.Input.Keyboard.Key;
    pageObjects!: Phaser.GameObjects.Group
    // Track key state independently to work around extensions (e.g. Evernote)
    // that intercept keyup and leave Phaser thinking keys are stuck down.
    keys = new Set<string>();
    playerMoved = false;
    hintShown = false;
    hintEl: HTMLElement | null = null;

    constructor(public pageInfo: PageInfo) {
        super(mySceneConfig);
    }

    preload() {
        this.load.image(AssetType.Bullet, "/assets/spaceinvaders/images/bitcoin36.png");
        this.load.image(AssetType.Ship, "/assets/spaceinvaders/images/player.png");
        this.load.spritesheet(AssetType.Kaboom, "/assets/spaceinvaders/images/explode.png", {
            frameWidth: 128,
            frameHeight: 128,
        });

        this.sound.volume = 0.5;
        this.load.audio(SoundType.Shoot, "/assets/spaceinvaders/audio/shoot.wav");
        this.load.audio(SoundType.Kaboom, "/assets/spaceinvaders/audio/explosion.wav");
        this.load.audio(SoundType.InvaderKilled, "/assets/spaceinvaders/audio/invaderkilled.wav");
    }

    create() {
        this.physics.world.gravity = new Phaser.Math.Vector2(0, 0)
        this.state = GameState.Playing;
        this.assetManager = new AssetManager(this);
        this.animationFactory = new AnimationFactory(this);
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.fireKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // Track key state ourselves in capture phase so extensions (e.g. Evernote)
        // that swallow keyup events can't leave keys stuck.
        const gameKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']);
        const onKeyDown = (e: KeyboardEvent) => { if (gameKeys.has(e.key)) this.keys.add(e.key); };
        const onKeyUp   = (e: KeyboardEvent) => { if (gameKeys.has(e.key)) this.keys.delete(e.key); };
        window.addEventListener('keydown', onKeyDown, { capture: true });
        window.addEventListener('keyup',   onKeyUp,   { capture: true });
        window.addEventListener('blur',    () => this.keys.clear());
        this.events.once(Phaser.Core.Events.DESTROY, () => {
            window.removeEventListener('keydown', onKeyDown, { capture: true });
            window.removeEventListener('keyup',   onKeyUp,   { capture: true });
            this.dismissHint();
        });

        this.time.delayedCall(5000, () => {
            if (!this.playerMoved) this.showHint();
        });
        this.player = Ship.create(this);
        this.scoreManager = new ScoreManager(this);

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === ' ' && (this.state === GameState.Win || this.state === GameState.GameOver)) {
                this.restart();
            }
        }, { capture: true });
        const { domArcadeBackgroundRects, domArcadeImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo)
       
        this.pageObjects = this.physics.add.group().addMultiple(domArcadeBackgroundRects).addMultiple(domArcadeImages)
        this.player.setDepth(1)
    }

    update() {
        this._shipKeyboardHandler();
        this.physics.overlap(
            this.assetManager.bullets,
            this.pageObjects,
            this._bulletHitPageObject as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

    }

    private _shipKeyboardHandler() {
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setVelocity(0, 0);
        if (this.keys.has('ArrowLeft')) {
            playerBody.setVelocityX(-200);
            this.playerMoved = true; this.dismissHint();
        } else if (this.keys.has('ArrowRight')) {
            playerBody.setVelocityX(200);
            this.playerMoved = true; this.dismissHint();
        }
        if (this.keys.has('ArrowUp')) {
            playerBody.setVelocityY(-200);
            this.playerMoved = true; this.dismissHint();
        } else if (this.keys.has('ArrowDown')) {
            playerBody.setVelocityY(200);
            this.playerMoved = true; this.dismissHint();
        }

        if (this.keys.has(' ')) {
            this.playerMoved = true; this.dismissHint();
            this._fireBullet();
        }
    }

    private showHint() {
        if (this.hintShown) return;
        this.hintShown = true;
        const el = document.createElement('div');
        this.hintEl = el;
        el.style.cssText = [
            'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
            'background:rgba(0,0,0,0.78)', 'color:#fff', 'font:16px/1.5 sans-serif',
            'padding:12px 20px', 'border-radius:10px', 'z-index:99999',
            'text-align:center', 'pointer-events:auto', 'cursor:pointer',
            'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
        ].join(';');
        el.innerHTML = '&#x2328;&#xFE0F; Arrow keys move &nbsp;&middot;&nbsp; Space bar shoots<br><small style="opacity:.7">Click to dismiss</small>';
        el.addEventListener('click', () => this.dismissHint());
        document.body.appendChild(el);
    }

    private dismissHint() {
        if (this.hintEl) {
            this.hintEl.remove();
            this.hintEl = null;
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
