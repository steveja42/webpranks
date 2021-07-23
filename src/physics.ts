import { Engine, Render, Bodies, World, Mouse, Composite, MouseConstraint } from "matter-js";
import { ModInfo } from "./domtomatter"
export enum CollisionCategory {
	default = 1,
	ground = 2,
	domBackground = 4,
	dom = 8,
	movingDom = 16
}

export function setupWorld(canvas: HTMLCanvasElement, width, height, background = ''): any {
	// Create an engine
	const engine = Engine.create();
	const world = engine.world
	// Create a renderer
	const render = Render.create({
		//element: document.body,
		canvas: canvas,
		engine: engine,
		options: {
			width,
			height,
			wireframes: false,
			background
		}
	})

	world.gravity.y = 0 //gravity; // 1 by default,



	// Run the engine
	Engine.run(engine);

	// Run the renderer
	Render.run(render);
	return { world, render, engine }

}

export function allowMouseToMoveWorldObjects(modInfo:ModInfo) {
	const mouse = Mouse.create(modInfo.render.canvas),
		mouseConstraint = MouseConstraint.create(modInfo.engine, {   
			mouse: mouse,
			constraint: {   //IConstraintDefinition 
				stiffness: 0.2,
				render: {
					visible: false
				}
			}
		});

		Composite.add(modInfo.world, mouseConstraint);

	// keep the mouse in sync with rendering
	//modInfo.render.mouse = mouse;
}