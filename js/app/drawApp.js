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
        canvasAll,
        contextAll,
        canvasTool,
        contextTool,
        canvasWidth,
        canvasHeight,
        undoManager,
        shapes = [],
        shapeId = 0
    ;


    function canvasSupport () {
        return Modernizr.canvas;
    }

    function clearCanvas() {
        contextAll.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function clearToolCanvas() {
        //contextTool.clearRect (0, 0, canvasTool.width, canvasTool.height);
        drawCanvas();
    }

    function drawCanvas() {
        clearCanvas();
        var i,
            shape;
        for (i = 0; i < shapes.length; i += 1) {
            shape = shapes[i];
            shape.draw(contextAll);
        }
    }

    function removeShape(id) {
        var i = 0, index = -1;

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

    function addShape(shape) {
        shapes.push(shape);

        clearToolCanvas();
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
            default:
                break;
        }

        if (undefined !== shape) {
            addShape (shape);
        }
    }

    function initColorPickers() {
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


    // This painting tool works like a drawing pencil which tracks the mouse 
    // movements.
    // The drawing pencil.
    var PencilTool = function (context) {
        var tool = this;

        this.started = false;
        this.context = context;

        $('#fillOptions').hide();  

        // This is called when you start holding down the mouse button.
        // This starts the pencil drawing.
        this.mousedown = function (ev) {
            tool.context.strokeStyle = strokeStyle;
            tool.context.beginPath();
            tool.context.moveTo(ev._x, ev._y);
            tool.started = true;
        };
            
        // This function is called every time you move the mouse. Obviously, it only 
        // draws if the tool.started state is set to true (when you are holding down 
        // the mouse button).
        this.mousemove = function (ev) {
            if (tool.started) {
                tool.context.lineTo(ev._x, ev._y);
                tool.context.stroke();
            }
        };

        // This is called when you release the mouse button.
        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;
                //img_update();
            }
        };
    };
 
    // The rectangle tool.
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
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                fill: fillOption,
                fillStyle: fillStyle
            });
            tool.rectangle.x = ev._x;
            tool.rectangle.y = ev._y;
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            var x = Math.min(ev._x,  tool.rectangle.x),
                y = Math.min(ev._y,  tool.rectangle.y),
                w = Math.abs(ev._x - tool.rectangle.x),
                h = Math.abs(ev._y - tool.rectangle.y);

            clearToolCanvas(); 

            if (!w || !h) {
                return;
            }

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

    // The line tool.
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
                x: 0,
                y: 0,
                endX: 100,
                endY: 100,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth
            });

            tool.line.x = ev._x;
            tool.line.y = ev._y;
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            clearToolCanvas();

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

    // The circle tool.
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
                x: 0,
                y: 0,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                radius: 50,
                fill: fillOption,
                fillStyle: fillStyle
            });      

            tool.circle.x = ev._x;
            tool.circle.y = ev._y;
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            clearToolCanvas();

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

    // The arc tool.
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
                x: 0,
                y: 0,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                radius: 50,
                angle: 90,
                counterclockwise: true            
            });        

            tool.arc.x = ev._x;
            tool.arc.y = ev._y;
        };

        this.mousemove = function (ev) {
            if (!tool.started) {
                return;
            }

            clearToolCanvas();

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

    var initModule = function () {
    
        if (!canvasSupport ()) {
            alert("This app cannot be run with this browser. Try Chrome, Firefox, Opera, Safari or Internet Explorer 9+.");
            return;
        }

        undoManager = new UndoManager();

        function updateUI() {
            $('#btnUndo').prop('disabled', !undoManager.hasUndo());
            $('#btnRedo').prop('disabled', !undoManager.hasRedo());
        }

        undoManager.setCallback(updateUI);

        var $canvasAll = $("#canvasAll");

        canvasAll = $canvasAll.get(0);
        contextAll = canvasAll.getContext('2d');  
        canvasWidth = $canvasAll.width();
        canvasHeight = $canvasAll.height();

        contextTool = contextAll; // canvasTool.getContext('2d');  

        var $canvasTool = $canvasAll; // $("#canvasTool");
 
        // The general-purpose event handler. This function just determines the mouse 
        // position relative to the canvas element.
        function ev_canvas (ev) {

            ev._x = ev.pageX - $canvasTool.offset().left;
            ev._y = ev.pageY - $canvasTool.offset().top;

            // Call the event handler of the tool.
            if (undefined !== currentTool) {
                var func = currentTool[ev.type];
                if (func) {
                    func(ev);
                }
            }
        }

        $canvasTool.mousedown (ev_canvas);
        $canvasTool.mousemove (ev_canvas);
        $canvasTool.mouseup (ev_canvas);

        initColorPickers();

        $('#btnUndo').click (function () {
            undoManager.undo();
            updateUI();
        });

        $('#btnRedo').click (function () {
            undoManager.redo();
            updateUI();
        });

        $('#btnClear').click (function () {
            undoManager.clear();
            updateUI();
        });

        $('#btnLine').click (function () {
            currentTool = new LineTool (contextTool);
        });

        $('#btnCircle').click (function () {
            currentTool = new CircleTool (contextTool);
        });

        $('#btnArc').click (function () {
            currentTool = new ArcTool (contextTool);
        });

        $('#btnRectangle').click (function () {
            currentTool = new RectangleTool (contextTool);
        });

        $('#btnPencil').click (function () {
            currentTool = new PencilTool (contextTool);
        });

        updateUI();        
    };

    return { 
        initModule: initModule 
    };
}());