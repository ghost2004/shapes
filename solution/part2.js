

/* Determine whether an object is an array. */
function isArray(a) {
	return (a && a.constructor == Array);
}

function dataItem(item) {
	this._date = new Date(item.date);
	this._val = item.level;
}

function ChartData(data) {
	this._chartD = new Array();
	this._minVal = 0;
	this._maxVal = 0;
	if (!isArray(data)){
		return null;
	}
	this._minVal = data[0].level;
	this._maxVal = data[0].level;
	for (var i = 0; i < data.length; i++) {
		var item = new dataItem(data[i]);
		this._chartD.push(item);
		if (item._val < this._minVal)
			this._minVal = item._val;
		else if (item._val > this._maxVal)
			this._maxVal = item._val;
			
	} 

}

function SVGPlot(svg, data) {
	this._width = svg.getAttribute("width");
	this._height = svg.getAttribute("height");
	this._svg = svg;
	this._chartData =new ChartData(data);

	this._left_blank = 60;
	this._right_blank = 40;
	this._bottom_blank = 60;
	this._top_blank = 40;
	this._x_per_blk = 24;
	
	this.getMapX = function(x) {
		var yr = x.getFullYear() - this._x_base.getFullYear();
		var m = yr*12 +  x.getMonth() - this._x_base.getMonth();
		return this._axis_x1+m*this._x_pels;
	};
	this.getMapY = function(y) {
		return this._axis_y1-Math.round((y - this._y_base)*this._y_pels);
	};
	this.initAxis = function() {
		this._axis_x1 = this._left_blank;
		this._axis_y1 = this._height - this._bottom_blank;
		this._axis_x2 = this._width - this._right_blank;
		this._axis_y2 = this._top_blank;
		this._x_max = this._axis_x2 - this._axis_x1;
		this._x_pels = this._x_max/this._chartData._chartD.length;
		
		if (this._x_pels < 1)
			this._x_pels = 1;
		
		var i = this._chartData._minVal;
		var u = 1;

		while (i >= 10){
			i = Math.floor(i / 10);
			u = u * 10;
		}

		this._y_base = i*u;
		this._x_base = this._chartData._chartD[0]._date;
		i = this._chartData._maxVal - this._y_base;		

		this._y_per_blk = u / 10;
		this._y_max = Math.ceil(i/this._y_per_blk)*this._y_per_blk;
		
		this._y_pels = (this._axis_y1 - this._axis_y2)/this._y_max;
		
		//alert("blk:"+this._y_per_blk+" max:"+this._y_max+" pels:"+this._y_pels );

		// Draw X axis		
		var x_axis = new Line().x1(this._axis_x1).y1(this._axis_y1)
				.x2(this._axis_x2).y2(this._axis_y1)
				.stroke('purple').strokeWidth(2)
            	.draw(this._svg);

		// Draw X axis units
        u = this._x_pels * this._x_per_blk;
        i = 23;
        while (u <= this._x_max) {
        	var m = new Line().x1(u + this._left_blank).y1(this._axis_y1)
        		.x2(u + this._left_blank).y2(this._axis_y2)
        		.stroke("#CCCCCC").strokeWidth(1).broken(true)
        		.draw(this._svg);
        	
        	var t = new Text()
            	.x(u + this._left_blank - 15).y(this._axis_y1+20)
            	.text(this._chartData._chartD[i]._date.getFullYear()+1)
            	.draw(svg);
        	i += this._x_per_blk;
        	u += this._x_pels * this._x_per_blk;
        }
	
		// Draw Y axis
		var y_axis = new Line().x1(this._axis_x1).y1(this._axis_y1)
				.x2(this._axis_x1).y2(this._axis_y2)
				.stroke('purple').strokeWidth(2)
            	.draw(this._svg);
       	// Draw Y axis units
       	i = this._y_base + this._y_per_blk;
       	while (i <= this._y_base + this._y_max) {
       		var uy = this.getMapY(i);
       		var l = new Line().x1(this._axis_x1).y1(uy)
        		.x2(this._axis_x2).y2(uy)
        		.stroke("#CCCCCC").strokeWidth(1).broken(true)
        		.draw(this._svg);
        	var v = new Text()
            	.x(this._axis_x1 - 30).y(uy+5)
            	.text(i)
            	.draw(svg);
       		i += this._y_per_blk;
       	}
		
	};
	
	this.drawData = function() {
		var prevX = this.getMapX(this._chartData._chartD[0]._date);
		var prevY = this.getMapY(this._chartData._chartD[0]._val);
		var newX, newY;
		for (var i = 1; i < this._chartData._chartD.length; i++) {
			newX = this.getMapX(this._chartData._chartD[i]._date);
			newY = this.getMapY(this._chartData._chartD[i]._val);
			var l = new Line().x1(prevX).y1(prevY)
        		.x2(newX).y2(newY)
        		.stroke("red").strokeWidth(1)
        		.draw(this._svg);
        	prevX = newX;
        	prevY = newY;	
        	
		}
	};
	
	this.initAxis();
	this.drawData();
	
	
}