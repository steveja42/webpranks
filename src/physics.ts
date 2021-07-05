import { Engine, Render, Bodies, World } from "matter-js";

export enum CollisionCategory {
	default = 1,
	ground = 2,
	moving = 4
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
	return {world, render, engine}

}

/*var ball = Bodies.circle(90, 280, 20, {
  render: {
	 sprite: {
		texture: "path/to/soccer_ball.png",
		xScale: 0.4,
		yScale: 0.4
	 }
  }
});*/
