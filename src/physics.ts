import { Engine, Render, Bodies, World } from "matter-js";

export function makeWorld(canvas: HTMLCanvasElement, width, height, background = '') {
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
			wireframes: false
		}
	})
	world.gravity.y = .5 //gravity; // 1 by default,

	const boxA = Bodies.rectangle(400, 200, 80, 80);
	const ballA = Bodies.circle(380, 100, 40);
	const ballB = Bodies.circle(460, 10, 40);
	const ground = Bodies.rectangle(400, 380, 810, 60, { isStatic: true });

	World.add(engine.world, [boxA, ballA, ballB, ground]);
	// Add all of the bodies to the world
if (background)
{	const gridBackground = Bodies.rectangle(0, 0, 1, 1, {
		isStatic: true,
		isSensor: true,
		render: {
			sprite: {
				texture: background,
				xScale: .1,
				yScale: .1
			}
		}
	});
	World.add(world, gridBackground);}
	// Run the engine
	Engine.run(engine);

	// Run the renderer
	Render.run(render);


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
