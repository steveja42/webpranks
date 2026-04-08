import { log, ll } from './util'
import { getSplits } from './modhelper'

export type PageObject = Phaser.GameObjects.Image & Phaser.GameObjects.Rectangle & {
    body: Phaser.Physics.Arcade.Body
};


/**
 * explodes gameObject into pieces
 * Currently works for Rectangles and Images.
 * @param xImpact 
 * @param yImpact 
 * @param gameObject 
 */
export function explode(xImpact: number, yImpact: number, gameObject: PageObject, gameGroup: Phaser.GameObjects.Group): PageObject[] | null {

    const pieces = breakUp(xImpact, yImpact, gameObject)
    const scene = gameObject.scene
    gameObject.destroy()
    if (!pieces)
        return null
    const width = scene.scale.width
    const height = scene.scale.height
    gameGroup?.addMultiple(pieces)
    const speed = 200
    const xSpeedMax = 200
    const ySpeedMax = 200
    if (pieces.length == 2) {
        scene.physics.accelerateTo(pieces[0], 0, height / 2, speed, xSpeedMax, ySpeedMax)
        scene.physics.accelerateTo(pieces[1], width, height / 2, speed, xSpeedMax, ySpeedMax)
    }
    if (pieces.length == 4) {
        scene.physics.accelerateTo(pieces[0], 0, 0, speed, xSpeedMax, ySpeedMax)
        scene.physics.accelerateTo(pieces[1], width, 0, speed, xSpeedMax, ySpeedMax)
        scene.physics.accelerateTo(pieces[2], 0, height, speed, xSpeedMax, ySpeedMax)
        scene.physics.accelerateTo(pieces[3], width, height, speed, xSpeedMax, ySpeedMax)
    }

    return pieces

}


/**
 * Breaks up a gameObject into pieces and returns those pieces in an array of gameObjects. You should generally then destroy the original gameObject.
 * Currently works for Rectangles and Images.
 * @param xImpact 
 * @param yImpact 
 * @param gameObject 
 */
export function breakUp(xImpact: number, yImpact: number, gameObject: PageObject): PageObject[] | null {

    if (gameObject.type !== 'Image' && gameObject.type !== 'Rectangle')
        return null
    const width = gameObject.displayWidth
    const height = gameObject.displayHeight
    if (width * height < 50)
        return null
    const xTrue = gameObject.x - width/2
    const yTrue = gameObject.y - height/2
    log(ll.trace, `breaking up "${gameObject.name}" type=${gameObject.type} (${xTrue.toFixed(0)},${yTrue.toFixed(0)} - ${(xTrue + width).toFixed(0)},${(yTrue + height).toFixed(0)}) ${width.toFixed(0)} x ${height.toFixed(0)} at ${xImpact.toFixed(0)},${yImpact.toFixed(0)}`)  //${gameObject.body.id}
    const scene = gameObject.scene
    const newObjects: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
    const splits = getSplits(width, height, xImpact-xTrue, yImpact-yTrue)
    if (gameObject.type === 'Image') {
        const texture = gameObject.texture
        const baseName = texture.frameTotal
        const frameX = gameObject.frame?.cutX || 0
        const frameY = gameObject.frame?.cutY || 0
        splits.forEach((split, i) => {
            const frame = texture.add(baseName + i, 0, frameX + split.x, frameY + split.y, split.width, split.height)
            const cx = xTrue + split.x + split.width / 2
            const cy = yTrue + split.y + split.height / 2
            const piece = scene.physics.add.image(cx, cy, texture, frame!.name)
            piece.name = `${gameObject.name}.${i}`
            log(ll.trace, `created piece ${piece.name} at (${cx.toFixed(0)},${cy.toFixed(0)}) with frame ${frame!.name}`)
            newObjects.push(piece)
        })
    }
    else {
        const fillColor = gameObject.fillColor
        splits.forEach((split, i) => {
            const cx = xTrue + split.x + split.width / 2
            const cy = yTrue + split.y + split.height / 2
            const piece = scene.physics.add.existing(scene.add.rectangle(cx, cy, split.width, split.height, fillColor)) as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody
            piece.name = `${gameObject.name}.${i}`
            newObjects.push(piece)
        })
    }

    return newObjects as PageObject[]

}