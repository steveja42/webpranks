import { Engine, Render, Bodies, World, Body, Composite, Constraint, MouseConstraint } from "matter-js"
import { PageGraphics } from '../domtoobjects'
import { log } from '../util'
import { CollisionCategory } from '../phaseri'
import {center, ms, getRandomInt} from '../modhelper'

export async function doPageEffect(m: PageGraphics) {
	/* //world.gravity.y = 1
	const width = render.canvas.width
	const height = render.canvas.height
	const groundHeight = 10
	const wallWidth = 10
	const ground = Bodies.rectangle(center(0, width), center(height - groundHeight, height), width, groundHeight, {
		isStatic: true,
		render: { fillStyle: "blue" },
		collisionFilter: {
			mask: CollisionCategory.ground | CollisionCategory.movingDom,
			category: CollisionCategory.ground
		}
	});
	//engine.world.gravity.y =1
		
	//World.add(world, [ground]);
	World.add(world, [
		// walls
		Bodies.rectangle(center(0, width), 0, width-wallWidth/2, wallWidth, { isStatic: true }),
		Bodies.rectangle(center(0, width), height, width, wallWidth, { isStatic: true })
		//Bodies.rectangle(width, center(0,height), wallWidth, height, { isStatic: true }),
		//Bodies.rectangle(0, center(0,height), wallWidth, height, { isStatic: true })
  ]);
	const wreckingBall = Bodies.circle(75, 50, width/18, { density: 0.04, frictionAir: 0.005, render: { fillStyle: "black" },
	collisionFilter: {
		mask: CollisionCategory.default | CollisionCategory.ground | CollisionCategory.dom | CollisionCategory.domBackground,
		category: CollisionCategory.default
	} });

	Composite.add(world, wreckingBall);
	Composite.add(world, Constraint.create({
		pointA: { x: width/2, y: -100 },
		bodyB: wreckingBall
	}));
*/
}

