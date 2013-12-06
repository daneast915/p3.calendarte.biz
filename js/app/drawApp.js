/*
 * drawApp.js
 * Root namespace module
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 4,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : true,
  white  : true
*/
/*global $, drawApp */

var drawApp = (function () {

    var currentTool = false,
        strokeStyle = "#000000",
        fillStyle = "#0000ff",
        fillOption = true,
        lineWidth = 5,
        drawingCanvas,
        drawingContext,
        canvasWidth,
        canvasHeight,
        undoManager,
        shapes = [],
        shapeId = 0
    ;


    /**
     * Determines is the browser supports the canvas API
     * @return {Boolean} true is canvas is supported
     */
    function canvasSupport () {
        return Modernizr.canvas;
    }

    /**
     * Clears all contents from the canvas context
     */
    function clearCanvas() {
        drawingContext.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    /**
     * Draws all the shapes currently in the shapes array.
     * Calls the draw(context) method on each Shape object. 
     */
    function drawCanvas() {
        clearCanvas();

        var i,
            shape;

        for (i = 0; i < shapes.length; i += 1) {
            shape = shapes[i];
            shape.draw(drawingContext);
        }
    }

    /**
     * Removes a shape from the shapes array
     * @param {Number} id - id of the shape in the array 
     */
    function removeShape(id) {
        var i = 0, 
            index = -1;

        for (i = 0; i < shapes.length; i += 1) {
            if (shapes[i].id === id) {
                index = i;
            }
        }

        if (index !== -1) {
            shapes.splice(index, 1);
        }

        drawCanvas();
    }

    /**
     * Adds a shape to the shapes array
     * @param {Object} shape - a Shape object - instance of one of the Shapes in Shapes.js
     */
    function addShape(shape) {
        shapes.push(shape);

        drawCanvas();

        var attrs = JSON.stringify(shape);

        undoManager.add({
            undo: function () {
                removeShape(shape.id);
            },
            redo: function () {
                createShape(attrs);
            }
        });
    }

    /**
     * Creates a shape from attributes stored in the UndoManager buffer
     * @param {Object} attributes from the Undo buffer 
     */
    function createShape(attrs) {
        var obj = JSON.parse(attrs),
            shape
        ;

        switch (obj.shapeType) {
            case Shapes.ShapeType.Line:
                shape = new Shapes.Line (obj);
                break;
            case Shapes.ShapeType.Rectangle:
                shape = new Shapes.Rectangle (obj);
                break;
            case Shapes.ShapeType.Circle:
                shape = new Shapes.Circle (obj);
                break;
            case Shapes.ShapeType.Arc:
                shape = new Shapes.Arc (obj);
                break;
             case Shapes.ShapeType.PencilDrawing:
                shape = new Shapes.PencilDrawing (obj);
                break;               
            default:
                break;
        }

        if (undefined !== shape) {
            addShape (shape);
        }
    }

    /**
     * Initializes all of the drawing options
     */
    function initDrawingOptions() {
        $("#lineColor").spectrum({
            color: strokeStyle,
            showPalette: true,
            showSelectionPalette: true,            
            change: function(color) {
                if (null != color && undefined != color) {
                    var hex = color.toHexString(); // #ff0000
                    if (undefined != hex)
                        strokeStyle = hex;
                }
            }
        });  

        $("#widthSpinner").spinner()
            .spinner( "value", lineWidth )
            .spinner({
                spin: function( event, ui ) {
                    lineWidth = ui.value;
                }
            });
 
        $("#fillOption").prop('checked', fillOption);
        $("#fillOption").change (function() {
            fillOption = $("#fillOption").prop('checked');
        });
 
        $("#fillColor").spectrum({
            color: fillStyle,
            showPalette: true,
            showSelectionPalette: true,  
            change: function(color) {
                if (null != color && undefined != color) {
                    var hex = color.toHexString(); // #ff0000
                    if (undefined != hex)
                        fillStyle = hex;
                }
            }
        });  
 
    }

    /**
     * Update the undo/redo enabled status
     */
    function updateUndoRedo() {
        $('#btnUndo').prop('disabled', !undoManager.hasUndo());
        $('#btnRedo').prop('disabled', !undoManager.hasRedo());
    }

    /**
     * Save canvas contents as a PNG file
     */
    function saveAsPNG() {
        // draw to canvas...
        drawingCanvas.toBlob(function(blob) {
            saveAs(blob, "canvas.png");
        });
    }

    /*--------------------------------------------------------------------------------------------
    *
    * Drawing Tools
    *
    *-------------------------------------------------------------------------------------------*/

    /**
    * @class PencilTool
    * @classdesc This painting tool works like a drawing pencil which tracks the mouse movements..
    */
    var PencilTool = function (context) {
        var tool = this;

        this.started = false;
        this.context = context;

        $('#fillOptions').hide();  

        // This is called when you start holding down the mouse button.
        // This starts the pencil drawing.
        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;

            tool.pencilDrawing = new Shapes.PencilDrawing ({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth
            });
        };
            
        // This function is called every time you move the mouse. Obviously, it only 
        // draws if the tool.started state is set to true (when you are holding down 
        // the mouse button).
        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            drawCanvas(); 

            var point = {
                x: ev._x, 
                y: ev._y
            };
            tool.pencilDrawing.addPoint (point);
            tool.pencilDrawing.draw (tool.context);
        };

        // This is called when you release the mouse button.
        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.pencilDrawing);
            }
        };
    };
 
    /**
    * @class RectangleTool
    * @classdesc The rectangle tool - can draw stroked rectangles or filled rectangles
    */
    var RectangleTool = function (context) {
        var tool = this;

        this.started = false;
        this.context = context;

        $('#fillOptions').show(); 

        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;

            tool.rectangle = new Shapes.Rectangle({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                width: 1,
                height: 1,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                fill: fillOption,
                fillStyle: fillStyle
            });
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            var x = Math.min(ev._x,  tool.rectangle.x),
                y = Math.min(ev._y,  tool.rectangle.y),
                w = Math.abs(ev._x - tool.rectangle.x),
                h = Math.abs(ev._y - tool.rectangle.y);

            if (!w || !h) {
                return;
            }

            drawCanvas(); 

            tool.rectangle.x = x;
            tool.rectangle.y = y;
            tool.rectangle.width  = w;
            tool.rectangle.height = h;

            tool.rectangle.draw (tool.context);
        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.rectangle);
            }
        };
    };

    /**
    * @class LineTool
    * @classdesc The line tool.
    */
    var LineTool = function (context) {
        var tool = this;
        
        this.started = false;
        this.context = context;

        $('#fillOptions').hide(); 

        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;

            tool.line = new Shapes.Line({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                endX: ev._x,
                endY: ev._y,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth
            });
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            drawCanvas();

            tool.line.endX = ev._x;
            tool.line.endY = ev._y;

            tool.line.draw (tool.context);
        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.line);
            }
        };
    };

    /**
    * @class CircleTool
    * @classdesc The circle tool.
    */
    var CircleTool = function (context) {
        var tool = this;
        
        this.started = false;
        this.context = context;

        $('#fillOptions').show(); 

        function getLineLength (x, y, x0, y0){
            return Math.sqrt((x -= x0) * x + (y -= y0) * y);
        }

        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;

            tool.circle = new Shapes.Circle({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                radius: 50,
                fill: fillOption,
                fillStyle: fillStyle
            });      
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            drawCanvas();

            tool.circle.radius = getLineLength (tool.circle.x, tool.circle.y, ev._x, ev._y);

            tool.circle.draw (tool.context);
        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.circle);
            }
        };
    };

    /**
    * @class ArcTool
    * @classdesc The arc tool.
    */
    var ArcTool = function (context) {
        var tool = this;

        this.started = false;
        this.context = context;

        $('#fillOptions').hide(); 

        function getLineLength (x, y, x0, y0) {
            return Math.sqrt((x -= x0) * x + (y -= y0) * y);
        }
        
        function getDegreeAngle (x1, y1, x2, y2, x3, y3) {
            var theta1 = Math.atan2( (y1-y2),(x1-x2) );
            var theta2 = Math.atan2( (y3-y2),(x3-x2) );
            var theta = (theta2-theta1)*180/Math.PI;
            theta = (theta+360)%360;
            return theta.toFixed(2);
        }

        this.mousedown = function (ev) {
            tool.started = true;
            shapeId += 1;
 
            tool.arc = new Shapes.Arc({
                id: shapeId,
                x: ev._x,
                y: ev._y,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                radius: 50,
                angle: 90,
                counterclockwise: true            
            });        
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            drawCanvas();

            tool.arc.radius = getLineLength (tool.arc.x, tool.arc.y, ev._x, ev._y);
            tool.arc.angle = getDegreeAngle (0, 0, tool.arc.x, tool.arc.y, ev._x, ev._y);

            tool.arc.draw (tool.context);
        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                addShape (tool.arc);
            }
        };
    };


    /**
     * initModule - called from the index.html to start things off
     */
    var initModule = function () {
    
        if (!canvasSupport ()) {
            alert("This app cannot be run with this browser. Try Chrome, Firefox, Opera, Safari or Internet Explorer 9+.");
            return;
        }

        // UndoManager handles undo/redo/clear
        undoManager = new UndoManager();

        undoManager.setCallback(updateUndoRedo);

        var $drawingCanvas = $("#drawingCanvas");

        drawingCanvas = $drawingCanvas.get(0);
        drawingContext = drawingCanvas.getContext('2d');  
        canvasWidth = $drawingCanvas.width();
        canvasHeight = $drawingCanvas.height();
 
        //
        // The general-purpose event handler. This function just determines the mouse 
        // position relative to the canvas element.
        //
        function ev_canvas (ev) {

            ev._x = ev.pageX - $drawingCanvas.offset().left;
            ev._y = ev.pageY - $drawingCanvas.offset().top;

            // Call the event handler of the tool.
            if (undefined !== currentTool) {
                var func = currentTool[ev.type];
                if (func) {
                    func(ev);
                }
            }
        }

        $drawingCanvas.mousedown (ev_canvas);
        $drawingCanvas.mousemove (ev_canvas);
        $drawingCanvas.mouseup (ev_canvas);

        //
        // Setup the drawing options
        //
        initDrawingOptions();

        //
        // Setup button event handlers
        //
        $('#btnUndo').click (function () {
            undoManager.undo();
            updateUndoRedo();
        });

        $('#btnRedo').click (function () {
            undoManager.redo();
            updateUndoRedo();
        });

        $('#btnClear').click (function () {
            undoManager.clear();
            updateUndoRedo();
        });

        $('#btnSave').click (function () {
            saveAsPNG();
        });

        $('#tool_line').click (function () {
            $('.tool_button').removeClass('tool_button_current');
            $('#tool_line').addClass ('tool_button_current');
            currentTool = new LineTool (drawingContext);
        });

        $('#tool_circle').click (function () {
            $('.tool_button').removeClass('tool_button_current');
            $('#tool_circle').addClass ('tool_button_current');
            currentTool = new CircleTool (drawingContext);
        });

        $('#tool_arc').click (function () {
            $('.tool_button').removeClass('tool_button_current');
            $('#tool_arc').addClass ('tool_button_current');
            currentTool = new ArcTool (drawingContext);
        });

        $('#tool_rectangle').click (function () {
            $('.tool_button').removeClass('tool_button_current');
            $('#tool_rectangle').addClass ('tool_button_current');
            currentTool = new RectangleTool (drawingContext);
        });

        $('#tool_pencil').click (function () {
            $('.tool_button').removeClass('tool_button_current');
            $('#tool_pencil').addClass ('tool_button_current');
            currentTool = new PencilTool (drawingContext);
        });

        //
        // Start off with the Pencil tool
        //
        $('#tool_pencil').addClass ('tool_button_current');
        currentTool = new PencilTool (drawingContext);

        updateUndoRedo();        
    };

    return { 
        initModule: initModule 
    };
}());