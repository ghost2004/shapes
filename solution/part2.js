

/* Determine whether an object is an array. */
function isArray(a) {
	return (a && a.constructor == Array);
}

function dataItem(item) {
	this._date = new Date(item.date);
	this._val = item.level;
	this.str = function() {
		var s = "Date: "+ this._date.getFullYear() + "-" + (this._date.getMonth()+1);
		s += " Level: " + this._val;
		return s;
	};
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
	
	this._svg = svg;
	
	this._width = this._svg.getAttribute("width");
	this._height = this._svg.getAttribute("height");
	
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
	
	// Draw X & Y axis
	this.initAxis = function() {
		this._axis_x1 = this._left_blank;
		this._axis_y1 = this._height - this._bottom_blank;
		this._axis_x2 = this._width - this._right_blank;
		this._axis_y2 = this._top_blank;
		this._x_tip_max = this._axis_x2 - 150;
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
            	.draw(this._svg);
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
            	.draw(this._svg);
       		i += this._y_per_blk;
       	}
		
	};
	
	// Draw time series line chart
	this.drawData = function() {
		var prevX = this.getMapX(this._chartData._chartD[0]._date);
		var prevY = this.getMapY(this._chartData._chartD[0]._val);
		var newX, newY;
		for (var i = 1; i < this._chartData._chartD.length; i++) {
			newX = this.getMapX(this._chartData._chartD[i]._date);
			newY = this.getMapY(this._chartData._chartD[i]._val);
			var l = new Line().x1(prevX).y1(prevY)
        		.x2(newX).y2(newY)
        		.stroke("green").strokeWidth(1)
        		.draw(this._svg);
        	prevX = newX;
        	prevY = newY;	
        	
		}
		
	};
	// get the data by time
	this.getDataByX = function(x) {
		var idx = Math.floor((x - this._axis_x1)/this._x_pels);
		if (idx < 0)
			idx = 0;
		else if (idx >= this._chartData._chartD.length)
			idx = this._chartData._chartD.length - 1;
		
		return this._chartData._chartD[idx];
	};
	// Initialize the tip information
	this.initTip = function() {
		// the tip line
		this._tip_line  = new Line().x1(this._axis_x1).y1(this._axis_y1)
			.x2(this._axis_x1).y2(this._axis_y2)
            .stroke('red').strokeWidth(1).broken(true)
            .draw(svg)._shape;
	
		// get the first element 
		var obj = this._chartData._chartD[0];
		
		// the tip text
		var tip = new Text().x(this._axis_x1).y(this._axis_y2-10)
			.text(obj.str()).draw(svg);
	
		this._tip_txt = tip._shape;
		this._tip_data = tip._data;
		
		// the tip dot
		this._tip_circle = new Circle()
            .center(this._axis_x1, this.getMapY(obj._val)).width(6)
            .fill('red')
            .draw(svg)._shape;

	};
	
	// update info when mouse moves
	this.updateCursor = function(evt) {
        // Get the mouse x and y coordinates
        var x = evt.clientX;
        var y = evt.clientY;
        
        // adjust x coordinates
        if (x < this._axis_x1)
        	x = this._axis_x1;
        else if (x > this._axis_x2)
        	x = this._axis_x2;

		// move the tip line 
        this._tip_line.setAttributeNS(null, "x1", x);
        this._tip_line.setAttributeNS(null, "x2", x);
        if (x < this._x_tip_max )
        	this._tip_txt.setAttributeNS(null, "x", x);
        else
        	this._tip_txt.setAttributeNS(null, "x", this._x_tip_max);
        
        // update the tip text
        var obj = this.getDataByX(x);
        this._tip_data.textContent  = obj.str();
        
        // set the tip dot
        this._tip_circle.setAttributeNS(null, "cx", x);
    	this._tip_circle.setAttributeNS(null, "cy", this.getMapY(obj._val));
        

	};
	
	this.initAxis();
	this.drawData();
	this.initTip();

}