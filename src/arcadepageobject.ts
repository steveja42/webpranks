import { log } from './util'
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
export function explode(xImpact, yImpact, gameObject: PageObject, gameGroup:Phaser.GameObjects.Group): PageObject[] {

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
        scene.physics.accelerateTo(pieces[0], 0, height / 2,speed, xSpeedMax, ySpeedMax)
        scene.physics.accelerateTo(pieces[1], width, height / 2,speed, xSpeedMax, ySpeedMax)
    }
    if (pieces.length == 4) {
        scene.physics.accelerateTo(pieces[0], 0, 0,speed, xSpeedMax, ySpeedMax)
        scene.physics.accelerateTo(pieces[1], width, 0,speed, xSpeedMax, ySpeedMax)
        scene.physics.accelerateTo(pieces[2], 0, height,speed, xSpeedMax, ySpeedMax)
        scene.physics.accelerateTo(pieces[3], width, height,speed, xSpeedMax, ySpeedMax)
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
export function breakUp(xImpact, yImpact, gameObject: PageObject): PageObject[] {

    const MinArea = 50
    if (gameObject.type !== 'Image' && gameObject.type !== 'Rectangle')
        return null
    const width = gameObject.displayWidth
    const height = gameObject.displayHeight
    if (width * height < MinArea)
        return null
    log(`breaking up  ${width} - ${height}`)  //${gameObject.body.id}
    const scene = gameObject.scene
    const x = gameObject.x
    const y = gameObject.y
    const newObjects: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
    const splits = getSplits(width, height)
    if (gameObject.type === 'Image') {
        const texture = gameObject.texture
        const baseName = texture.frameTotal
        const frameX = gameObject.frame?.cutX || 0
        const frameY = gameObject.frame?.cutY || 0
        splits.forEach((split, i) => {
            const frame = texture.add(baseName + i, 0, frameX + split.x, frameY + split.y, split.width, split.height)

            newObjects.push(scene.physics.add.image(x + split.x, y + split.y, texture, frame.name))
        })
    }
    else {
        const fillColor = gameObject.fillColor
        splits.forEach((split, i) => {

            newObjects.push(scene.physics.add.existing(scene.add.rectangle(x + split.x, y + split.y, split.width, split.height, fillColor)) as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody)


        })
    }

    return newObjects as PageObject[]

}