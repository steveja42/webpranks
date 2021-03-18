import { Engine, Render, Bodies, World } from "matter-js";

export function doPhysics(canvas: HTMLCanvasElement, width, height) {
	// Create an engine
	const engine = Engine.create();

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
  

	const boxA = Bodies.rectangle(400, 200, 80, 80);
	const ballA = Bodies.circle(380, 100, 40);
	const ballB = Bodies.circle(460, 10, 40);
	const ground = Bodies.rectangle(400, 380, 810, 60, { isStatic: true });

	World.add(engine.world, [boxA, ballA, ballB, ground]);
	// Add all of the bodies to the world


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
