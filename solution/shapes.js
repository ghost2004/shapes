

function Line() {
	
	this.leftX = 0;
	this.leftY = 0;
	this.rightX = 0;
	this.rightY = 0;
	this.color = "red";
	this.width = 1;

		
	this.x1 = function x1() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.leftX;
		else {
			this.leftX = arguments[0];
			return this;
		}
	};
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.stroke = stroke;
	this.strokeWidth = strokeWidth;
	this.draw = draw;
		
	
	function y1() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.leftY;
		else {
			this.leftY = arguments[0];
			return this;
		}
	}
	function x2() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.rightX;
		else {
			this.rightX = arguments[0];
			return this;
		}
	}
	function y2() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.rightY;
		else {
			this.rightY = arguments[0];
			return this;
		}
	}
	function stroke() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.color;
		else {
			this.color = arguments[0];
			return this;
		}
	}
	function strokeWidth() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.rightX;
		else {
			this.rightX = arguments[0];
			return this;
		}
	}
	function draw(svg) {
		//svg.moveTo(this.leftX, this.leftY);
		/*
		var node = document.createElement("line");
		node.setAttribute("x1", 100);
		node.setAttribute("x2", 200);
		node.setAttribute("y1", 100);
		node.setAttribute("y2", 200);
		node.setAttribute("stroke", "purple");
		node.setAttribute("stroke-width", 10);
		*/

		svg.innerHTML = "<line stroke=\"purple\" stroke-width=\"10\" x1=\"200\" x2=\"300\" y1=\"50\" y2=\"100\"></line>";
		alert(svg.innerHTML);
		//svg.appendChild(node);
		return this;
	}
	/* Create a shape node with the given settings. */
	/*
	_makeNode: function(parent, name, settings) {
		parent = parent || this._svg;
		var node = this._svg.ownerDocument.createElementNS($.svg.svgNS, name);
		for (var name in settings) {
			var value = settings[name];
			if (value != null && value != null && 
					(typeof value != 'string' || value != '')) {
				node.setAttribute($.svg._attrNames[name] || name, value);
			}
		}
		parent.appendChild(node);
		return node;
	},*/
	/* Draw a line.
	   @param  parent    (element or jQuery) the parent node for the new shape (optional)
	   @param  x1        (number) the x-coordinate for the start of the line
	   @param  y1        (number) the y-coordinate for the start of the line
	   @param  x2        (number) the x-coordinate for the end of the line
	   @param  y2        (number) the y-coordinate for the end of the line
	   @param  settings  (object) additional settings for the shape (optional)
	   @return  (element) the new shape node */
	/*line: function(parent, x1, y1, x2, y2, settings) {
		var args = this._args(arguments, ['x1', 'y1', 'x2', 'y2']);
		return this._makeNode(args.parent, 'line', $.extend(
			{x1: args.x1, y1: args.y1, x2: args.x2, y2: args.y2}, args.settings || {}));
	},*/

			
}
