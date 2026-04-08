import Phaser from 'phaser'
import { PageInfo, setBackgroundAndCreateDomObjects } from '../modhelper'
import { breakUp, PageObject } from '../arcadepageobject'

const mySceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    key: 'PageScene',
    physics: { arcade: { debug: false, gravity: { x: 0, y: 30 } } },
}

export function doPageEffect(pageInfo: PageInfo): Phaser.Scene {
    const pageScene = new PageScene(pageInfo)
    pageInfo.game!.scene.add(mySceneConfig.key!, pageScene)
    return pageScene
}

const Speed = 250

export class PageScene extends Phaser.Scene {
    dino!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    pageObjects!: Phaser.GameObjects.Group
    floor!: Phaser.Physics.Arcade.StaticGroup
    keys = new Set<string>()
    dragging = false

    constructor(public pageInfo: PageInfo) {
        super(mySceneConfig)
    }

    preload() {
        this.load.image('dino', '/assets/dino.png')
        this.load.audio('smash', ['/assets/audio/glass-smash-6266.mp3', '/assets/audio/glass-smash-6266.ogg'])
    }

    create() {
        const { width, height } = this.sys.game.canvas

        const { domArcadeBackgroundRects, domArcadeImages } = setBackgroundAndCreateDomObjects(this, this.pageInfo)
        this.pageObjects = this.physics.add.group()
            .addMultiple(domArcadeBackgroundRects)
            .addMultiple(domArcadeImages)
        domArcadeBackgroundRects.forEach((o, i) => {
            o.body.setAllowGravity(false)
        })
        domArcadeImages.forEach((o, i) => {
            o.body.setAllowGravity(false)
        })

        // Spawn dino scaled to ~20% of canvas height
        const dinoNativeH = 472
        const dinoNativeW = 680
        const targetH = height * 0.20
        const scale = targetH / dinoNativeH

        this.dino = this.physics.add.image(width / 2, height / 2, 'dino')
            .setScale(scale)
            .setDepth(10)

        // Random initial velocity
        const angle = Math.random() * Math.PI * 2
        this.dino.body.setAllowGravity(false)
        this.dino.body.setDamping(true)
        this.dino.body.setDrag(0.4)
        this.dino.body.setVelocity(Math.cos(angle) * Speed, Math.sin(angle) * Speed)
        this.dino.body.setMaxVelocity(Speed, Speed)

        // Keyboard capture (same pattern as wreckingball / btcinvaders)
        const gameKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])
        const onKeyDown = (e: KeyboardEvent) => { if (gameKeys.has(e.key)) this.keys.add(e.key) }
        const onKeyUp   = (e: KeyboardEvent) => { if (gameKeys.has(e.key)) this.keys.delete(e.key) }
        window.addEventListener('keydown', onKeyDown, { capture: true })
        window.addEventListener('keyup',   onKeyUp,   { capture: true })
        window.addEventListener('blur',    () => this.keys.clear())
        this.events.once(Phaser.Core.Events.DESTROY, () => {
            window.removeEventListener('keydown', onKeyDown, { capture: true })
            window.removeEventListener('keyup',   onKeyUp,   { capture: true })
        })

        // Mouse drag
        this.input.on('pointerdown', () => { this.dragging = true })
        this.input.on('pointerup',   () => { this.dragging = false })
        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (this.dragging) {
                this.dino.setPosition(p.x, p.y)
                this.dino.body.reset(p.x, p.y)
            }
        })

        // Invisible floor at bottom of screen
        this.floor = this.physics.add.staticGroup()
        const floorRect = this.add.rectangle(width / 2, height + 10, width, 20)
        this.physics.add.existing(floorRect, true)
        this.floor.add(floorRect)
    }

    update() {
        const body = this.dino.body

        if (this.dragging) {
            // Position is set directly in pointermove; stop physics velocity
            body.setVelocity(0, 0)
        } else if (this.keys.size > 0) {
            const vx = this.keys.has('ArrowLeft') ? -Speed : this.keys.has('ArrowRight') ? Speed : 0
            const vy = this.keys.has('ArrowUp')   ? -Speed : this.keys.has('ArrowDown')  ? Speed : 0
            body.setVelocity(vx, vy)
        } else {
            // Wander: bounce off world edges by reversing velocity only when moving toward the wall
            const { width, height } = this.sys.game.canvas
            const hw = this.dino.displayWidth / 2
            const hh = this.dino.displayHeight / 2
            if (this.dino.x - hw <= 0 && body.velocity.x < 0) {
                body.setVelocityX(-body.velocity.x)
                this.dino.x = hw
            } else if (this.dino.x + hw >= width && body.velocity.x > 0) {
                body.setVelocityX(-body.velocity.x)
                this.dino.x = width - hw
            }
            if (this.dino.y - hh <= 0 && body.velocity.y < 0) {
                body.setVelocityY(-body.velocity.y)
                this.dino.y = hh
            } else if (this.dino.y + hh >= height && body.velocity.y > 0) {
                body.setVelocityY(-body.velocity.y)
                this.dino.y = height - hh
            }
        }

        // Flip sprite to face direction of travel
        if (body.velocity.x < 0) this.dino.setFlipX(true)
        else if (body.velocity.x > 0) this.dino.setFlipX(false)

        // Smash page objects on overlap
        this.physics.overlap(
            this.dino,
            this.pageObjects,
            this._onSmash as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        )
    }

    private _lastSmashSound = 0

    private _onSmash(_dino: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, pageObject: PageObject) {
        this.pageObjects.remove(pageObject, false, false)
        const now = this.time.now
        if (now - this._lastSmashSound > 400) {
            this.sound.play('smash')
            this._lastSmashSound = now
        }
        const pieces = breakUp(this.dino.x, this.dino.y, pageObject)
        pageObject.destroy()
        pieces?.forEach(p => {
            // Launch piece away from Godzilla's center
            const dx = p.x - this.dino.x
            const dy = p.y - this.dino.y
            const len = Math.sqrt(dx * dx + dy * dy) || 1
            const speed = 200 + Math.random() * 150
            p.body.setVelocity((dx / len) * speed, (dy / len) * speed)
            p.body.setCollideWorldBounds(true)
            p.body.setBounce(0.6)
            p.body.setDamping(true)
            p.body.setDrag(0.35)
            this.time.delayedCall(2000, () => {
                if (p.active && !this.pageObjects.contains(p)) {
                    this.pageObjects.add(p)
                }
            })
        })
    }
}
