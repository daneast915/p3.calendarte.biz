p3.calendarte.biz
=================

P3 Project for Harvard Extension School Dynamic Web Applications class

This application is a basic HTML5 canvas drawing app with the following tools:
* Pencil
* Line
* Rectangle
* Circle

The Shapes are added to an array and also an UndoRedo buffer.  Undo removes the
Shapes from the array, but they can be recreating using the JSON that reflects
the contents of the Shapes.

There are several drawing options, some of which are enabled or disabled for the
given tool:
* Line Color
* Line Width
* Fill        (rectangle & circle)
* Fill Color  (rectangle & circle)

The canvas contents can be saved as a PNG file.

The Shapes classes were developed using the TypeScript language, which is a 
superset of JavaScript created by Microsoft.  The tsc compiler generates the
JavaScript that is loaded into the browser.  Using TypeScript was a good way
to learn about JavaScript modules and related patterns.


Daniel East
