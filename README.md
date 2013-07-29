GeoSphere
=========

Leveraging the IsoSphere (from three.js) to do global simulations, data modeling, etc.

All the points on the IsoSphere are (very nearly) equadistant from their neighbors and (except for the 12 original
points) have six neighbors. This makes them ideal for simulations where neighbor interactions are important.

This also means that unlike polar data, you don't have a bunch of points clustered around the pole; there is no reason
you need as much

What this library adds is:

1) annotation on the uv points for
   * a list of neighbors
   * the (immediate) parents
   * The Vertex (3d space point)
   * Metadata such as elevation, hydration, etc.

2) Visualization: the ability to generate a canvas based on data of the nearest UV point
   * The visualization colors the (usually hexagonal) spot around a single point
   * Renders in under a minute, even for 100k UV points (7 degrees of tessellation); simple IsoSpheres (2-5 degrees of
    tessellation) render in seconds!

2) Point indexing: easily find out the nearest UV coordinate or 3D point with a two-level index of all the points

3) Underscore based "alter" method to run a routine over all the points.
   * Can execute in descending order of granularity/tessellation to allow more original points to influence more
   detailed ones

4) The ability to interpret 2d height maps into metadata for the sphere; for instance,
   to create a colored map of the Earth or MarS based on height values from a height map.

This library allows you to run a simulation of global data at a low tessellation, fast rate,
then amp up the tessellation until the run time is no longer acceptable.

Also, (soon) you should be able to run simulations on a regional set of data to, say,
create a very high res map of a smaller region.

CLASSES
=======

The core IsoSphere class from Three.js (and associated Vector2 and Vector3 et.all) is at the core of GeoSphere.
However GeoSphere greatly extends and interlinks the Vector2/UV points and indexes them for rapid retrieval.

Texture map rendering is done using Node/Canvas and EaselJS/Canvas.

Work is being done in earnest for erosion simulation, wind simulation, rain simulation et.all.