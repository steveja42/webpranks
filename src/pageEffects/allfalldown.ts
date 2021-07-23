import { Engine, Render, Bodies, World, Body } from "matter-js"
import { ModInfo } from '../domtomatter'
import { log } from '../util'
import {CollisionCategory} from '../physics'
import {center, ms, getRandomInt} from '../modhelper'

export async function doPageEffect({ world, bodies, render }: ModInfo) {
	//world.gravity.y = 1
	const width = render.canvas.width
	const height = render.canvas.height
	const groundHeight = 10
	const ground = Bodies.rectangle(center(0, width), center(height - groundHeight, height), width, groundHeight, {
		isStatic: true,
		render: { fillStyle: "blue" },
		collisionFilter: {
			mask: CollisionCategory.ground | CollisionCategory.movingDom,
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
		body.collisionFilter.category = CollisionCategory.movingDom
		body.collisionFilter.mask = CollisionCategory.ground | CollisionCategory.movingDom
		Body.setVelocity(body, { x: 0, y: 10 })
		bodiesToDo.splice(i, 1)
		await ms(1000)
	}
}

