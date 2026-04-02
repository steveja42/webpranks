export default function AboutPage() {
	return (
		<div className="container py-5 prose-page" style={{ maxWidth: '800px' }}>
			<h1>About Web Pranks: The Ultimate Website Visual Simulator</h1>
			<p className="lead">
				Welcome to Web Pranks, the internet's favorite sandbox for harmless digital mischief. We built
				this tool for anyone who has ever looked at a cluttered news site or a boring corporate homepage
				and thought, "This really needs a wrecking ball."
			</p>

			<h2>What is Web Pranks?</h2>
			<p>
				Web Pranks is an interactive website prank generator that allows you to apply high-fidelity
				visual effects to any URL. Using advanced browser-based rendering, we create a "digital overlay"
				on top of existing websites, letting you smash, drop, or celebrate on any page you choose.
			</p>

			<h2>Our Core Mission</h2>
			<ul>
				<li>
					<strong>Harmless Fun:</strong> Creating tools for hilarious screenshots, reaction videos, and
					office jokes.
				</li>
				<li>
					<strong>Creative Coding:</strong> Providing a playground for developers to experiment with
					game physics in a web environment.
				</li>
				<li>
					<strong>Zero Footprint:</strong> Ensuring that "pranking" remains a purely local,
					non-destructive experience.
				</li>
			</ul>

			<h2>How It Works (The Tech Stack)</h2>
			<p>
				For the technically curious, Web Pranks isn't "hacking" — it's sophisticated front-end
				engineering. The project is built using a modern, high-performance stack:
			</p>
			<ul>
				<li>
					<strong>Phaser 3:</strong> Our primary engine for 2D physics and animations. Every "Wrecking
					Ball" or "Falling Element" is a physics-enabled sprite within a Phaser scene.
				</li>
				<li>
					<strong>React &amp; TypeScript:</strong> The UI framework that manages state, URL inputs, and
					the prank library.
				</li>
				<li>
					<strong>Vite:</strong> Our lightning-fast build tool that ensures the app loads in
					milliseconds.
				</li>
				<li>
					<strong>DOM Integration:</strong> We use a custom script to intelligently "scrape" the visual
					elements of a target website and convert them into interactive textures that our physics
					engine can manipulate.
				</li>
			</ul>

			<h2>Is Web Pranks Safe? (The "No-Hacks" Guarantee)</h2>
			<p>
				Yes. Web Pranks is 100% safe. One of the most common questions we get is, "Am I actually
				changing the website?" The answer is a definitive <strong>No</strong>.
			</p>
			<p>
				<strong>The Sandbox Principle:</strong> All visual effects occur strictly within your browser's
				memory. When you use our Wrecking Ball on a site, the actual server of that site remains
				untouched. If you refresh the page or look at it on another device, the site is exactly as it
				was. We do not inject code into third-party servers, and we do not store any data from the
				sites you choose to prank.
			</p>

			<h2>For Developers: Build Your Own Prank</h2>
			<p>
				Web Pranks was designed to be extensible. We believe the best pranks are the ones we haven't
				thought of yet.
			</p>
			<p>
				The project is open-source friendly and follows a modular architecture. Each prank is a
				standalone Phaser3 Scene. If you know JavaScript or TypeScript, you can write your own effect,
				drop it into our <code>pageEffects</code> folder, and see it live instantly.
			</p>
			<p>
				<strong>Why contribute?</strong>
			</p>
			<ul>
				<li>
					<strong>Learn Game Physics:</strong> Master Matter.js and Phaser3 by manipulating real-world
					web elements.
				</li>
				<li>
					<strong>Portfolio Piece:</strong> Your prank could be seen and used by thousands of people
					globally.
				</li>
				<li>
					<strong>Community:</strong> Join a group of developers who love blending web tech with game
					design.
				</li>
			</ul>

			<h2>Frequently Asked Questions</h2>

			<h3>Does this work on every website?</h3>
			<p>
				Most of them! Sites with extremely high security headers (like banking sites) may block our
				ability to "see" their images for the prank, but for 99% of the web, the chaos works
				perfectly.
			</p>

			<h3>Can my boss see what I'm doing?</h3>
			<p>
				Only if they are looking over your shoulder. Remember: the "destruction" is only happening on
				your screen.
			</p>

			<h3>How do I stop the prank?</h3>
			<p>
				Just hit the <strong>Back</strong> button or press <strong>Esc</strong>. The "real" world will
				be right back where you left it.
			</p>
		</div>
	)
}
