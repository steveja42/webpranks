import { AssetType } from "./assets";

export class Ship {
    static create(scene: Phaser.Scene): Phaser.Physics.Arcade.Sprite {
        const ship = scene.physics.add.sprite(scene.scale.width/2, scene.scale.height - 40, AssetType.Ship);
        ship.setCollideWorldBounds(true);
        return ship;
    }
}