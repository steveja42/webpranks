#  Web Pranks

Web Pranks is a website, [webfun.click](https://www.webfun.click/) , that lets you appear to prank other websites. For example, enter *cnn.com* as the Website Address, choose *Wrecking Ball* for the Prank, and then a wrecking ball will appear to smash the current CNN website- though all changes actually only happen on the local device.

  

##  How to add your own prank to Web Pranks!

  

Web Pranks was designed so developers can easily add their own pranks to it. Each prank is basically a [Phaser3](https://phaser.io/phaser3) scene. To add your own prank, export a function named *doPageEffect* in a Typescript or JavaScript file.

    export  function  doPageEffect(page:  PageInfo):  Phaser.Scene

*doPageEffect* should add a scene to the game and then return the scene.
You will be passed a pageInfo object which contains a phaser game object and an array of images of elements from the webpage being pranked, and an array of rectangles for all the background rectangles on the page. Phaser3 textures will already be pre-loaded for the images with the key names of *dom0* through *domx* when there are *x* number of images.

Pranks are in the *src/pageEffects* folder and you can look there for examples. To run your prank put your typescript or javascript file in the *src/pageEffects* folder and add the title and filename of your prank to a new line in *modulelist.ts*. Then build the app and you can run your prank! After testing it do a pull request to add your prank to the main Web Pranks website.

  

##  Building the app

This project uses [Vite](https://vitejs.dev/) + React with TypeScript. Use `pnpm` for all package management.

##  Available Scripts

In the project directory, you can run:

###  `pnpm dev`

Runs the app in development mode.

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will hot-reload if you make edits.

###  `pnpm build`

Builds the app for production to the `dist` folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

###  `pnpm preview`

Locally previews the production build.

##  Learn More

You can learn more in the [Vite documentation](https://vitejs.dev/guide/).

To learn React, check out the [React documentation](https://reactjs.org/).