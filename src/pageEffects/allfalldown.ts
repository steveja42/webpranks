import { Engine, Render, Bodies, World, Body } from "matter-js"
import { modInfo } from '../domtomatter'
import { log } from '../util'
import {CollisionCategory} from '../physics'

export async function doPageEffect({ world, bodies, render }: modInfo) {
	//world.gravity.y = 1
	const width = render.canvas.width
	const height = render.canvas.height
	const groundHeight = 10
	const ground = Bodies.rectangle(center(0, width), center(height - groundHeight, height), width, groundHeight, {
		isStatic: true,
		render: { fillStyle: "blue" },
		collisionFilter: {
			mask: CollisionCategory.ground | CollisionCategory.moving,
			category: CollisionCategory.ground
		}
	});

	World.add(world, [ground]);
	await ms(2000)
	const bodiesToDo = bodies.map((value, index) => index)
	while (bodiesToDo.length) {
		const i = getRandomInt(bodiesToDo.length)
		log (`moving body ${bodiesToDo[i]}`)
		const body = bodies[bodiesToDo[i]]
		body.collisionFilter.category = CollisionCategory.moving
		body.collisionFilter.mask = CollisionCategory.ground | CollisionCategory.moving
		Body.setVelocity(body, { x: 0, y: 10 })
		bodiesToDo.splice(i, 1)
		await ms(1000)
	}
}

function center(start, end) {

	return start + (end - start) / 2
}

/**
 * returns promise that resolves in time given by milliSeconds
 * @param milliSeconds 
 * bla bla
 * more
 */
async function ms(milliSeconds: number) {

	return new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, milliSeconds);
	});
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}