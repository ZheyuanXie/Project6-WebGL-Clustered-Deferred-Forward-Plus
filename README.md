WebGL Clustered and Forward+ Shading
======================

**University of Pennsylvania, CIS 565: GPU Programming and Architecture, Project 5**

* Zheyuan Xie
* Tested on: Windows 10 Pro, i7-7700HQ @ 2.80GHz, 16GB, GTX 1050 2GB (Dell XPS 15 9560)

### Live Demo

[![](img/thumb.png)](https://zheyuanxie.github.io/Project6-WebGL-Clustered-Deferred-Forward-Plus/)

Use keyboard shortcut to switch between rendering mode:
 - <1> - Switch to *simple forward rendering*.
 - <2> - Switch to *clustered forward rendering*.
 - <3> - Switch to *clustered deferred rendering*.
 - <4> - Switch to *clustered deferred rendering with Blinn-Phong shading*.

### Video Demo

Link to video: [https://youtu.be/wNil31n5d4k](https://youtu.be/wNil31n5d4k)

### Features

Render Implemented:

 - **Clustered Forward (Forward Plus) Renderer**: Populate `clusterTexture` to store number of lights and list of lights for each cluster.
 - **Clustered Deferred Renderer**: Store vertex color, position, and normal into g-buffer. Do clustered rendering with information from g-buffer.

Effects:

 - Blinn-Phong Shading for clustered deferred renderer.

Optimization:

 - Pack value into `vec4` and use 2-component normals.

### Performance Analysis

![](img/performance.png)

 - Simple forward rendering has the worst performance.
 - Clustered forward rendering has more advantage as the number of lights increases.
 - Clustered deferred rendering is generally much more faster than the previous two methods at the cost of higher memory bandwitdh.

### Credits

* [Three.js](https://github.com/mrdoob/three.js) by [@mrdoob](https://github.com/mrdoob) and contributors
* [stats.js](https://github.com/mrdoob/stats.js) by [@mrdoob](https://github.com/mrdoob) and contributors
* [webgl-debug](https://github.com/KhronosGroup/WebGLDeveloperTools) by Khronos Group Inc.
* [glMatrix](https://github.com/toji/gl-matrix) by [@toji](https://github.com/toji) and contributors
* [minimal-gltf-loader](https://github.com/shrekshao/minimal-gltf-loader) by [@shrekshao](https://github.com/shrekshao)
