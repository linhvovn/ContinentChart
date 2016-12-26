/**
 * Define CONSTANTS -----------------------------------------------------
 */
var CONST = {
	CLASS : {
		BASE_COUNTRY : "baseCountry",
		HEXAGON_TOP : "topFace",
		HEXAGON_LEFT : "leftRect",
		HEXAGON_RIGHT : "rightRect",
		HEXAGON_BOT : "botRect",
		SELECTED_OBJECT : "selected",
		TOWER_GROUP : "tower",
		TOWER_FLOOR : "floor",
		COUNTRY_GROUP : "country",
		CONTINENT_GROUP : "continent",
		CHART_GROUP : "chart",
		TITLE : "svgTitle",
		TITLE_DIV : "titleDiv",
		TITLE_OUTER : "titleOuterDiv",
		LEGEND : "legend",
		LEGEND_ITEM : "legendItem"
	},
	CALCULATION : {
		HEXAGON_DEG : (Math.PI * 2) / 6,
		HEXAGON_DEEP_RATIO : 3,
		DEFAULT_ZOOM_RATIO : 3,
		TOWER_RADIUS_RATIO : 2 / 3,
		Y_OFFSET_RATIO : 4,
		TOWER_MARGIN : 3,
		MAX_VIEW_PORT : 1000000,
		DEFAULT_TITLE_HEIGHT : 100,
		DEFAULT_TITLE_MARGIN : 20,
		DEFAULT_TITLE_MARGIN_TOP : 10
	},
	CUSTOM_ATTRS : {
		ZOOM_TEXT : "zoomText",
		ZOOM : "zoom",
		NEAR_SHAWDOW : "nearShadow"
	}
};

/**
 * Define CONTROL module with useful function -----------------------------------------------------
 */
var CONTROL = {
		//add attribute into element tag
		_addAttr : function(element, attrs) {
			if (element && attrs) {
				for ( var key in attrs) {
					d3.select(element).attr(key, attrs[key]);
				}
			}
		},
		//add attribute into elements tag
		_addAttrs : function(elements, attrs) {
			if (elements && attrs) {
				for (var i = 0; i < elements.length; ++i) {
					CONTROL._addAttr(elements[i], attrs);
				}
			}
		},

		/**
		 * Add style attributes
		 * @param element
		 * @param attrs
		 */
		addStyle : function(element, attrs) {
			if (element && attrs) {
				for ( var key in attrs) {
					d3.select(element).style(key, attrs[key]);
				}
			}
		},

		/**
		 * Used to add attributes to @elements tag
		 * @param elements
		 * @param attrs
		 */
		addAttrs : function(elements, attrs) {
			if (elements && attrs) {
				if (elements instanceof Array) {
					CONTROL._addAttrs(elements, attrs);
				} else {
					CONTROL._addAttr(elements, attrs);
				}
			}
		},

		/**
		 * Create new object with the same content as @obj
		 * @param obj
		 * @returns {___anonymous956_957}
		 */
		cloneObj : function(obj) {
			var newObj = {};
			for ( var key in obj) {
				newObj[key] = obj[key];
			}
			;
			return newObj;
		},

		/**
		 * Cross-browser Object.create()
		 * @param proto
		 * @returns {F}
		 */
		inherit : function(proto) {
			function F() {
			}
			;
			F.prototype = proto;
			return new F();
		},

		/**
		 * Inheritance
		 * @param Child
		 * @param Parent
		 */
		extend : function(Child, Parent) {
			Child.prototype = CONTROL.inherit(Parent.prototype);
			Child.prototype.constructor = Child;
			Child.parent = Parent.prototype;
		},

		/**
		 * Create in memory @tag
		 * @param attrs
		 * @param tag
		 * @returns
		 */
		createInMemoryGroup : function(attrs, tag) {
			var newTag = tag ? tag : "g";
			var newElement = document.createElementNS("http://www.w3.org/2000/svg",
					newTag);
			if (attrs) {
				for ( var attr in attrs) {
					newElement.setAttribute(attr, attrs[attr] ? attrs[attr] : "");
				}
			}
			return newElement;
		},

		/**
		 * Append child inside parent
		 * @param parent
		 * @param child
		 */
		drawInside : function(parent, child) {
			d3.select(parent).node().appendChild(child);
		},

		/**
		 * ZoomIn
		 * @param ratio
		 * @param parent
		 * @param child
		 * @param center
		 */
		zoomIn : function(ratio, parent, child, center) {
			var zoomRatio = ratio ? ratio : CONST.CALCULATION.DEFAULT_ZOOM_RATIO;
			d3.select(child).classed(CONST.CUSTOM_ATTRS.ZOOM, true);
			d3.select(parent).insert(
					d3.select(child).attr(CONST.CUSTOM_ATTRS.ZOOM_TEXT),
					"g." + CONST.CUSTOM_ATTRS.ZOOM);
			d3.select(child).transition().attr('transform',
					CONTROL._getScaleMatrixForZooming(zoomRatio, center.x, center.y));
			d3.select(child.nearestViewportElement).node().appendChild(
					d3.select(child).node());
		},

		/**
		 * ZoomOut
		 * @param parent
		 * @param child
		 */
		zoomOut : function(parent, child) {
			d3.select(child).classed(CONST.CUSTOM_ATTRS.ZOOM, false);
			d3.select(child).transition().attr('transform', null);
			d3.select(parent).node().insertBefore(
					d3.select(child).node(),
					d3.select(d3.select(child).attr(CONST.CUSTOM_ATTRS.ZOOM_TEXT))
							.node());
			d3.select(d3.select(child).attr(CONST.CUSTOM_ATTRS.ZOOM_TEXT)).remove();
		},

		/**
		 * Calculate scaling matrix
		 * @param n - zooming ratio
		 * @param x - coordinate 
		 * @param y - coordinate
		 * @returns {String}
		 */
		_getScaleMatrixForZooming : function(n, x, y) {
			var matrix = "";
			matrix = 'matrix(' + n + ' 0 0 ' + n + ' -' + (n - 1) * x + ' -' + (n - 1)
					* y * Math.cos(Math.PI / 3) + ')'
			return matrix;
		},
		/**
		 * Swap two input
		 * @param obj1
		 * @param obj2
		 */
		swap : function(obj1, obj2) {
			return [ obj2, obj1 ];
		},
		/**
		 * Append simple tooltip
		 */
		_addToolTip : function()
		{
			return d3.select("body").append("div")
		    .attr("class", "bizTooltip")               
		    .style("opacity", 0);
		},
		/**
		 * Display tooltip on page
		 */
		showToolTip	: function(data,type)
		{
			var div = d3.select("div.bizTooltip")[0];
			if (div == null || div[0] == null)
				{
					CONTROL._addToolTip();
				}
			div = d3.select("div.bizTooltip")[0][0];
			if (data.link != undefined && type=="link" && d3.select(div).classed("link") == false )
			{
//				if (d3.select(div).style("opacity") == 0 || d3.select(div).html().length ==0)
//					{
						d3.select(div).html('<iframe class="iframeToolTip" sandbox="allow-scripts allow-popups allow-forms Access-Control-Allow-Origin" src="'+data.link+'"></iframe>');
					 	$("body").on("dblclick",function(){
					 		CONTROL.hideToolTip(true);
					 	}); 
					 	d3.select(div).on("mouseout",function(){
					 		d3.event.stopPropagation();
			            });
						d3.select(div).classed("link",true);
						d3.select(div).style("pointer-events","auto");
//					}
			}
			else if (d3.select(div).classed("link") == false && data.text != undefined)
			{
				d3.select(div).html(data.text)  
	            .style("left", (d3.event.pageX) + "px")     
	            .style("top", (d3.event.pageY) + "px");
				d3.select(div).classed("link",false).style("pointer-events","none");
				d3.select(div).on("mouseout",function(){
	            	CONTROL.hideToolTip();
	            });
			}
			d3.select(div).transition()        
            .duration(500)      
            .style("opacity", .9);   
		},
		/**
		 * Hide tooltip on page
		 */
		hideToolTip	: function(force)
		{
			var div = d3.select("div.bizTooltip")[0][0];
			if (div != null && (d3.select(div).classed("link") == false || force == true))
				{
					d3.select(div).classed("link",false);
					d3.select(div).transition()        
		                .duration(500)      
		                .style("opacity", 0);  
					d3.select(div).html('');
				}
		},
		/**
		 * Add filers definitions
		 */
		addFiltersDef :function(svg)
		{
			d3.select(svg).append("defs").html('<filter id="'+CONST.CUSTOM_ATTRS.NEAR_SHAWDOW+'" x="0" y="0" width="200%" height="200%">'+
				      '<feOffset result="offOut" in="SourceGraphic" dx="0" dy="10" />'+
				      '<feColorMatrix result="matrixOut" in="offOut" type="matrix"'+
				      'values="0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0" />'+
				      '<feGaussianBlur result="blurOut" in="matrixOut"/>'+
				      '<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />'+
				    '</filter>');
		}
};

/**
 * Define POINT module -----------------------------------------------------
 */
var POINT = function(x, y) {
	this.x = x;
	this.y = y;
};

/**
 * PUBLIC METHOD 
 */

POINT.prototype.init = function() {
	return this.x + "," + this.y;
};

//getting string representation of this point
POINT.prototype.getString = function() {
	return this.x + "," + this.y;
};

//check if this point is in left side of another point
POINT.prototype.isLeft = function(point) {
	return (this.x < point.x ? true : false);
};

//check if this point is in top of another point
POINT.prototype.isTop = function(point) {
	return (this.y < point.y ? true : false);
};

POINT.prototype.widthDistance = function(point) {
	return point.x - this.x;
};

POINT.prototype.heightDistance = function(point) {
	return point.y - this.y;
};

/**
 * STATIC METHOD
 */
//getting string representation of many points
POINT.getPointString = function(points) {
	var st = "";
	for ( var p in points) {
		st = st + points[p].getString() + " ";
	}
	return st;
};

/**
 * Define BASESHAPE module
 * - BASESHAPE will be used as abstract class and should not be instantiated directly
 * - Return Object:
 * {
 * 		data: --the same as input 
 * 		attrs:{
 * 				boundary {topLeft : @POINT, botRight : @POINT}
 * 				titleContainer {topLeft : @POINT, botRight: @POINT, attrs{}}
 * 				}
 * 		shapes:{
 * 			title: <foreignobject>
 * 		}
 * 		parent
 *      group : <g>
 * }
 */
var BASESHAPE = function(input) {
	// 1.Contains inputed data: mandatory {center: @Point, attributes:{},groupClass,...}
	this.data = {};
	// 2. Contains attributes
	this.attrs = {};
	// 3. Each object is bounded by a group
	this.group = null;
	// 4. Others shapes of this object will be controlled by shapes
	this.shapes = {};
	// 5. Parent element
	this.parent = null;
	// 6. Used for zooming
	this.attrs.isZooming = false;
	//init
	try {
		this.init(input);
	} catch (e) {
		console.log("INPUT ERROR!");
		console.log(e);
	}
	;

};

/**
 * PUBLIC METHODS
 */
BASESHAPE.prototype.init = function(input) {
	//Copy content of input into data
	//			this.data 	= CONTROL.cloneObj(input);
	this.data = input;
	//Set parent element
	this.parent = d3.select(this.data.parent).node();
	//Create group
	this._appendGroup_();
	//Create group element
	this._afterInit();
	//Cal boundary
	this._calBoundary();
	//Call title rectangle
	this._defineTitleRect();
};

//draw this obj
BASESHAPE.prototype.draw = function() {
	try {
		this._prepareDrawing();
		this._draw_();
		this._addTitle_();
		this._decorates_(this.data.styles);
		this.addEvents();
	} catch (e) {
		console.log("DRAW ERROR");
		console.log(e);
	}
	;

};

//change style
BASESHAPE.prototype.changeStyle = function(styles) {
	//			this.data.styles = CONTROL.cloneObj(styles);
	this.data.styles = styles;
	this._decorates_(styles);
};

//change title of this box
BASESHAPE.prototype.changeTitle = function(text) {
	this.data.title = text;
	this._addTitle_();
};

//change title position ***LIV1HC***
BASESHAPE.prototype.changeTitlePos = function(container) {
	this.attrs.titleContainer = container;

	d3.select(this.group).select("." + CONST.CLASS.TITLE).attr("x",
			this.attrs.titleContainer.topLeft.x).attr("y",
			this.attrs.titleContainer.topLeft.y).attr(
			"width",
			this.attrs.titleContainer.topLeft
					.widthDistance(this.attrs.titleContainer.botRight)).attr(
			"height",
			this.attrs.titleContainer.topLeft
					.heightDistance(this.attrs.titleContainer.botRight));

};

BASESHAPE.prototype.addEvents = function() {
	this._addOnclick();
};

BASESHAPE.prototype._addSelectEvent = function() {
	var that = this;
	d3.select(this.group).on("mouseover", function() {
		that.selectMe();
		if (that.data.toolTip!= undefined && that.data.toolTip.text != undefined)
		{
			that.showTooltip();	
		}
		that._afterSelect();
	}).on("mouseout", function() {
		that.deSelectMe();
		if (that.data.toolTip!= undefined && that.data.toolTip.text != undefined)
			{
				that.hideTooltip();
			}
		that._afterDeselect();
		
	});
};

BASESHAPE.prototype._addOnclick = function() {
	var that = this;
	d3.select(this.group).on("click", function() {
		if (that.data.toolTip!= undefined && that.data.toolTip.link != undefined)
		{
			that.showTooltip("link");	
		}
	});
};

//Show tooltip 
BASESHAPE.prototype.showTooltip = function(type) {
	if (this.data.toolTip) {
		CONTROL.showToolTip(this.data.toolTip,type);
	}
};

//Hide tooltip 
BASESHAPE.prototype.hideTooltip = function() {
	if (this.data.toolTip) {
		CONTROL.hideToolTip();
	}
};

//what happen if this object is selected
BASESHAPE.prototype._afterSelect = function() {

};
//what happen if this object is deselected
BASESHAPE.prototype._afterDeselect = function() {

};

//define id for this object based on its positions
BASESHAPE.prototype.getId = function() {
	return this.data.groupClass
			+ (this.data.center ? Math.floor(this.data.center.x).toString()
					+ Math.floor(this.data.center.y).toString() : "");
};

//define zooming function
BASESHAPE.prototype.zoomIn = function(ratio) {
	this.attrs.isZooming = true;
	CONTROL.zoomIn(ratio, this.parent, this.group, this.data.center);
};

BASESHAPE.prototype.zoomOut = function() {
	this.attrs.isZooming = false;
	CONTROL.zoomOut(this.parent, this.group);
};

//select whole object
BASESHAPE.prototype.selectMe = function() {
	d3.select(this.group).classed(CONST.CLASS.SELECTED_OBJECT, true);
	this.attrs.selected = true;
};

//de-select whole object
BASESHAPE.prototype.deSelectMe = function() {
	d3.select(this.group).classed(CONST.CLASS.SELECTED_OBJECT, false);
	this.attrs.selected = false;
};

BASESHAPE.prototype._calBoundary = function() {
	this.attrs.boundary = {
		topLeft : new POINT(CONST.CALCULATION.MAX_VIEW_PORT,
				CONST.CALCULATION.MAX_VIEW_PORT),
		botRight : new POINT(0, 0)
	};
};

/**
 * PRIVATE METHOD
 */
//Create element group
BASESHAPE.prototype._appendGroup_ = function() {
	if (this.data.css != undefined)
		{
			this.data.css.class = this.data.groupClass;
		}
	else
		{
			this.data.css = {class : this.data.groupClass};
		}
	this.group = CONTROL.createInMemoryGroup(this.data.css);
	this._addZoomText_();
};

//Append this.group inside this.parent
BASESHAPE.prototype._draw_ = function() {
	CONTROL.drawInside(this.parent, this.group);
};

//Add style attributes
BASESHAPE.prototype._decorates_ = function(styles) {
	if (styles) {
		for (key in this.data.styles) {
			//							var element = key != "group" ? d3.select(this.group).selectAll("."+key)[0] : this.group;
			if (key == "group") {
				CONTROL.addAttrs(this.group, this.data.styles[key].style);
			} else {
				this._recurDecorates_(this.data.styles[key], [ "." + key ], 1);
			}
		}
	}
};

BASESHAPE.prototype._recurDecorates_ = function(klass, currPaths, runner) {
	if (klass) {
		for (key in klass) {
			if (key == "style") {
				var currEle = BASESHAPE._recurSelection_([ this.group ],
						currPaths, 0);
				//								for (var i = 0; i<currPaths.length;++i)
				//									{
				//										currEle = d3.selectAll(currEle).selectAll(currPaths[i]);
				//									}
				if (currEle.length) {
					for (var i = 0; i < currEle.length; ++i) {
						CONTROL.addAttrs(currEle[i], klass.style);
					}
				}

			} else {
				currPaths[runner] = ("." + key);
				this._recurDecorates_(klass[key], currPaths, runner + 1);
			}
		}
	}
};

BASESHAPE._recurSelection_ = function(elements, currPaths, runner) {
	var result = [];
	if (runner < currPaths.length) {
		if (elements) {
			for (var i = 0; i < elements.length; ++i) {
				var ele = d3.select(elements[i]).selectAll(currPaths[runner])[0];
				var tResult = this._recurSelection_(ele, currPaths, runner + 1);
				if (tResult) {
					for (var j = 0; j < tResult.length; ++j)
						result.push(tResult[j]);
				}

			}
			return result;
		}
		return [];
	} else {
		return elements;
	}

};

BASESHAPE.prototype._addZoomText_ = function() {
	d3.select(this.group).attr(CONST.CUSTOM_ATTRS.ZOOM_TEXT, this.getId());
};

BASESHAPE.prototype._addTitle_ = function() {
	if (this.data.title) {
		if (!this.attrs.titleContainer) {
			this._defineTitleRect();
		}
		//append title obj
		this.shapes.title = d3
				.select(this.group)
				.append("foreignObject")
				.attr("class", CONST.CLASS.TITLE)
				.attr("x", this.attrs.titleContainer.topLeft.x)
				.attr("y", this.attrs.titleContainer.topLeft.y)
				.attr(
						"width",
						this.attrs.titleContainer.topLeft
								.widthDistance(this.attrs.titleContainer.botRight))
				.attr(
						"height",
						this.attrs.titleContainer.topLeft
								.heightDistance(this.attrs.titleContainer.botRight))
				.node();

		d3.select(this.shapes.title).append("xhtml:div").attr("class",
				CONST.CLASS.TITLE_OUTER).append("xhtml:div").attr("class",
				CONST.CLASS.TITLE_DIV+" title"+this.data.groupClass).text(this.data.title);

		this.setTitleStyle();
	}

};

BASESHAPE.prototype.setTitleStyle = function(styles) {
	if (styles) {
		this.attrs.titleContainer.attrs = styles;
	}

	if (this.attrs.titleContainer.attrs) {
		CONTROL.addStyle(d3.select(this.shapes.title).select(
				"." + CONST.CLASS.TITLE_DIV).node(),
				this.attrs.titleContainer.attrs);
	}
};

/**
 * PROTECTED METHODS
 */

//all stuffs for drawing this shape
BASESHAPE.prototype._prepareDrawing = function() {
	//this function will be implemented in each child class
};

BASESHAPE.prototype._afterInit = function() {
	//this function will be implemented in each child class
};

//calculate the rectangle which will contain the title for this obj
BASESHAPE.prototype._defineTitleRect = function() {
	this.attrs.titleContainer = {};
	this.attrs.titleContainer.topLeft = new POINT(
			this.attrs.boundary.topLeft.x, this.attrs.boundary.topLeft.y
					- CONST.CALCULATION.DEFAULT_TITLE_HEIGHT
					- CONST.CALCULATION.DEFAULT_TITLE_MARGIN_TOP);
	this.attrs.titleContainer.botRight = new POINT(
			this.attrs.boundary.botRight.x, this.attrs.boundary.topLeft.y
					- CONST.CALCULATION.DEFAULT_TITLE_MARGIN_TOP);
};

/**
 * Define HEXAGON module, inherit BASESHAPE
 * - Return Object:
 * {
 * 		data	: -- the same as @input 
 * 		attrs	:{
 * 			    	shapeData: {
 * 						top 		: {p1,p2,p3,p4,p5,p6} @POINT
 *    					leftRect	: {p1,p2,p3,p4} @POINT
 *    					botRect		: {p1,p2,p3,p4} @POINT
 *    					rightRect	: {p1,p2,p3,p4} @POINT
 * 					}
 * 					width
 * 					height
 * 					deep	
 * 					around			: [@boolean]
 * 					fullRelative	: @boolean
 * 					boundary		: {leftTop: @POINT, botRight:@POINT}
 * 		      	 }
 * 		shapes	:{
 * 					face 		<polygon>
 * 					leftRect 	<polygon>
 * 					botRect		<polygon>
 * 					rightRect	<polygon>
 * 		}
 * 		parent	: -- the same as in @input
 *      group	: <g>
 * }
 */
var HEXAGON = function(input) {
	HEXAGON.parent.constructor.apply(this, arguments);
	//used to mark relatives existing
	this.attrs.around = [ false, false, false, false, false, false ];
	//
	this.attrs.fullRelative = false;
};
CONTROL.extend(HEXAGON, BASESHAPE);

//final value
HEXAGON.MAX_RELATIVE = 6;
HEXAGON.RELATEIVE_TYPE = {
	TOP : 0,
	TOP_RIGHT : 1,
	BOT_RIGHT : 2,
	BOT : 3,
	BOT_LEFT : 4,
	TOP_LEFT : 5
};
HEXAGON.OPPOSITE_TYPE = [ 3, 4, 5, 0, 1, 2 ];

//Override
HEXAGON.prototype._afterInit = function() {
	this._calculatePoints_();
	this._calculateViewPort();
	this._calculateSide();
};

HEXAGON.prototype._prepareDrawing = function() {
	this._drawFace();
	this._drawSide();
};

HEXAGON.prototype.setRelative = function(position) {
	this.attrs.around[position] = true;
	this._reCalculateRelative();
};

//Calculate next relative position
HEXAGON.prototype.getNextRelative = function() {
	if (!this.attrs.fullRelative) {
		var i = 0;
		for (i = 0; i < HEXAGON.MAX_RELATIVE; ++i) {
			if (!this.attrs.around[i]) {
				break;
			}
		}
		if (i < HEXAGON.MAX_RELATIVE) {
			return {
				position : i,
				center : this._getRelativeCenter(i)
			};
		} else {
			this.attrs.fullRelative = true;
		}
	}
	return null;

};

//comparation
HEXAGON.prototype.isLeft = function(hexagon) {
	return this.data.center.isLeft(hexagon.data.center);
};

//comparation
HEXAGON.prototype.isBottom = function(hexagon) {
	return !this.data.center.isTop(hexagon.data.center);
};

//-------------- DATA CALCULATION -----------------------

//get a relative center point
HEXAGON.prototype._getRelativeCenter = function(type) {
	switch (type) {
	case HEXAGON.RELATEIVE_TYPE.TOP: {
		return {
			x : this.data.center.x,
			y : this.data.center.y - this.attrs.height
		};
	}
		;
	case HEXAGON.RELATEIVE_TYPE.TOP_RIGHT: {
		return {
			x : this.data.center.x + (0.75 * this.attrs.width),
			y : this.data.center.y - (this.attrs.height / 2)
		};
	}
		;
	case HEXAGON.RELATEIVE_TYPE.BOT_RIGHT: {
		return {
			x : this.data.center.x + (0.75 * this.attrs.width),
			y : this.data.center.y + (this.attrs.height / 2)
		};
	}
		;
	case HEXAGON.RELATEIVE_TYPE.BOT: {
		return {
			x : this.data.center.x,
			y : this.data.center.y + this.attrs.height
		};
	}
		;
	case HEXAGON.RELATEIVE_TYPE.BOT_LEFT: {
		return {
			x : this.data.center.x - (0.75 * this.attrs.width),
			y : this.data.center.y + (this.attrs.height / 2)
		};
	}
		;
	case HEXAGON.RELATEIVE_TYPE.TOP_LEFT: {
		return {
			x : this.data.center.x - (0.75 * this.attrs.width),
			y : this.data.center.y - (this.attrs.height / 2)
		};
	}
		;
	}
	;
};
//calculate all coordinates of top-face 
HEXAGON.prototype._calculatePoints_ = function() {
	var x = this.data.center.x, y = this.data.center.y, r = this.data.r;

	this.attrs.shapeData = {};
	this.attrs.shapeData.top = {};

	this.attrs.shapeData.top.p1 = HEXAGON._calculatePoint_(1, x, y, r);
	this.attrs.shapeData.top.p2 = HEXAGON._calculatePoint_(2, x, y, r);
	this.attrs.shapeData.top.p3 = HEXAGON._calculatePoint_(3, x, y, r);
	this.attrs.shapeData.top.p4 = HEXAGON._calculatePoint_(4, x, y, r);
	this.attrs.shapeData.top.p5 = HEXAGON._calculatePoint_(5, x, y, r);
	this.attrs.shapeData.top.p6 = HEXAGON._calculatePoint_(6, x, y, r);
};

//width/height/deep
HEXAGON.prototype._calculateViewPort = function() {
	this.attrs.width = 2 * this.data.r;
	this.attrs.height = this.attrs.width
			* Math.sin(CONST.CALCULATION.HEXAGON_DEG);
	this.attrs.deep = this.data.r / CONST.CALCULATION.HEXAGON_DEEP_RATIO;
};

//calculate all coordinates of sides
HEXAGON.prototype._calculateSide = function() {
	var topFace = this.attrs.shapeData.top;
	this.attrs.shapeData.leftRect = this._calculateRectPoints(topFace.p3,
			topFace.p2);
	this.attrs.shapeData.botRect = this._calculateRectPoints(topFace.p2,
			topFace.p1);
	this.attrs.shapeData.rightRect = this._calculateRectPoints(topFace.p1,
			topFace.p6);
};

//calculate a side by 2 points in top-face
HEXAGON.prototype._calculateRectPoints = function(p1, p2) {
	var p3 = new POINT(p2.x, p2.y + this.attrs.deep), p4 = new POINT(p1.x, p1.y
			+ this.attrs.deep);
	return {
		p1 : p1,
		p2 : p2,
		p3 : p3,
		p4 : p4
	};
};

//calculate a top-face point by index 
HEXAGON._calculatePoint_ = function(i, dx, dy, r) {
	var a = CONST.CALCULATION.HEXAGON_DEG;
	var xAxis = r * Math.cos(a * i) + dx;
	var yAxis = r * Math.sin(a * i) + dy;
	var x = Math.abs(xAxis), y = Math.abs(yAxis * Math.cos(2 * Math.PI / 3));
	return new POINT(x, y);
};

HEXAGON.prototype._reCalculateRelative = function() {
	this.attrs.fullRelative = false;
	for (var i = 0; i < this.attrs.around.length; ++i) {
		if (this.attrs.around[i] == false) {
			return;
		}
	}
	;
	this.attrs.fullRelative = true;
};

//Override
HEXAGON.prototype._calBoundary = function() {
	var topLeft = new POINT(CONST.CALCULATION.MAX_VIEW_PORT,
			CONST.CALCULATION.MAX_VIEW_PORT), botRight = new POINT(0, 0);

	for ( var key in this.attrs.shapeData) {
		for ( var face in this.attrs.shapeData[key]) {
			if (!topLeft.isLeft(this.attrs.shapeData[key][face])) {
				topLeft.x = this.attrs.shapeData[key][face].x;
			}

			if (botRight.isLeft(this.attrs.shapeData[key][face])) {
				botRight.x = this.attrs.shapeData[key][face].x;
			}

			if (!topLeft.isTop(this.attrs.shapeData[key][face])) {
				topLeft.y = this.attrs.shapeData[key][face].y;
			}

			if (botRight.isTop(this.attrs.shapeData[key][face])) {
				botRight.y = this.attrs.shapeData[key][face].y;
			}
		}
	}
	this.attrs.boundary = {
		topLeft : topLeft,
		botRight : botRight
	};
};
//-------------- DRAWING -----------------------
HEXAGON.prototype._drawFace = function() {
	this.shapes.face = d3.select(this.group).append("polygon").attr("class",
			CONST.CLASS.HEXAGON_TOP).attr("points",
			POINT.getPointString(this.attrs.shapeData.top)).node();
	;

};

HEXAGON.prototype._drawSide = function() {
	//left rect
	this.shapes.leftRect = d3.select(this.group).append("polygon").attr(
			"class", CONST.CLASS.HEXAGON_LEFT).attr("points",
			POINT.getPointString(this.attrs.shapeData.leftRect)).node();
	;

	//bot rect
	this.shapes.botRect = d3.select(this.group).append("polygon").attr("class",
			CONST.CLASS.HEXAGON_BOT).attr("points",
			POINT.getPointString(this.attrs.shapeData.botRect)).node();
	;

	//right rect
	this.shapes.rightRect = d3.select(this.group).append("polygon").attr(
			"class", CONST.CLASS.HEXAGON_RIGHT).attr("points",
			POINT.getPointString(this.attrs.shapeData.rightRect)).node();
	;
},
//-------------- EVENTS -----------------------
HEXAGON.prototype.addEvents = function() {
	this._addSelectEvent();

};


/**
 * Define TOWER module, inherit BASESHAPE
 * - Return Object:
 * {
 * 		data	: -- the same as @input 
 * 		attrs	:{
 * 			    	floorsData: [
 * 						{
 * 							count: //number of floor at this level
 * 							radius: //radius of floor at this level
 * 							shapes:[] @HEXAGON
 * 						},...
 * 					]
 * 					boundary		: {leftTop: @POINT, botRight:@POINT}
 * 		      	 }
 * 		shapes	:{}
 * 		parent	: -- the same as in @input
 *      group	: <g>
 * }
 */
var TOWER = function(input) {
	TOWER.parent.constructor.apply(this, arguments);
};
CONTROL.extend(TOWER, BASESHAPE);

//Override
TOWER.prototype._afterInit = function() {
	this._calculateFloorsCount();
	this._calculateFloorsRadius();
	this._createHexagons();
};

TOWER.prototype._prepareDrawing = function() {
	this._drawFloors();
};

//-------------- DATA CALCULATION -----------------------
TOWER._calculateFloorSteps = function(power) {
	var steps = [ 1 ];
	for (var i = 1; i <= power; ++i) {
		steps[i] = steps[i - 1] * 10;
	}
	;
	return steps;
};

TOWER.prototype._calculateFloorsCount = function() {
	var amount = this.data.amount, stepOfFloor = TOWER
			._calculateFloorSteps(this.data.sizeOfMaxFloor);
	this.attrs.floorsData = new Array(stepOfFloor.length);
	for (var i = stepOfFloor.length - 1; i >= 0; --i) {
		this.attrs.floorsData[stepOfFloor.length - i - 1] = {};
		this.attrs.floorsData[stepOfFloor.length - i - 1].count = Math
				.floor(amount / stepOfFloor[i]);
		amount = amount % stepOfFloor[i];
	}
	;
};

TOWER.prototype._calculateFloorsRadius = function() {
	this.attrs.floorsData[0].radius = this.data.r;
	for (var i = 1; i < this.attrs.floorsData.length; ++i) {
		this.attrs.floorsData[i].radius = TOWER
				._getFloorRadius(this.attrs.floorsData[i - 1].radius);
	}
};

TOWER._getFloorRadius = function(r) {
	return (r * CONST.CALCULATION.TOWER_RADIUS_RATIO);
};

TOWER.prototype._createHexagons = function() {
	var currX = this.data.center.x, currY = this.data.center.y;
	for (var i = 0; i < this.attrs.floorsData.length; ++i) {
		this.attrs.floorsData[i].shapes = new Array();
		var currFloor = null;
		if (this.attrs.floorsData[i].count > 0) {
			this.attrs.floorsData[i].shapes = new Array();
			for (var j = 0; j < this.attrs.floorsData[i].count; ++j) {
				var toolTip;
				if (this.data.toolTip.towers == undefined || this.data.toolTip.towers.length==0)
					{
						toolTip = this.data.toolTip;
					}
				else
					{
						toolTip = this.data.toolTip.towers[j];
					}
				var currFloorData = {
					center : new POINT(currX, currY),
					r : this.attrs.floorsData[i].radius,
					parent : this.group,
					groupClass : CONST.CLASS.TOWER_FLOOR + i,
					toolTip: toolTip
				};

				currFloor = new HEXAGON(currFloorData);
				this.attrs.floorsData[i].shapes[j] = currFloor;
				currY = currY - 2 * currFloor.attrs.deep;
			}
			currY = this.data.sizeOfMaxFloor == 0 ? currY : currY
					+ currFloor.attrs.deep;
		}
		;
	}
};

TOWER.prototype._calBoundary = function() {
	if (this.attrs.floorsData && this.attrs.floorsData.length) {
		var i = 0, j = this.attrs.floorsData.length - 1;
		while (!this.attrs.floorsData[i].shapes
				|| this.attrs.floorsData[i].shapes.length <= 0) {
			++i;
		}
		while (!this.attrs.floorsData[j].shapes
				|| this.attrs.floorsData[j].shapes.length <= 0) {
			--j;
		}

		var botRight = new POINT(
				this.attrs.floorsData[i].shapes[0].attrs.boundary.botRight.x,
				this.attrs.floorsData[i].shapes[0].attrs.boundary.botRight.y);
		var topLeft = new POINT(
				this.attrs.floorsData[i].shapes[0].attrs.boundary.topLeft.x,
				this.attrs.floorsData[j].shapes[this.attrs.floorsData[j].shapes.length - 1].attrs.boundary.topLeft.y);
		this.attrs.boundary = {
			topLeft : topLeft,
			botRight : botRight
		};
	}
};
//-------------- DRAWING -----------------------
TOWER.prototype._drawFloors = function() {
	for (var i = 0; i < this.attrs.floorsData.length; ++i) {
		for (var j = 0; j < this.attrs.floorsData[i].shapes.length; ++j) {
			this.attrs.floorsData[i].shapes[j].draw();
		}
	}
};

TOWER.prototype._addOnclick = function() {
	var that = this;
	d3.select(this.group).on("click", function() {
		//find current selected
		for (var i = 0; i < that.attrs.floorsData.length; ++i) {
			for (var j = 0; j < that.attrs.floorsData[i].shapes.length; ++j) {
				if (that.attrs.floorsData[i].shapes[j].attrs.selected == true && that.attrs.floorsData[i].shapes[j].data.toolTip != undefined
						&& that.attrs.floorsData[i].shapes[j].data.toolTip.link != undefined)
				{
					that.attrs.floorsData[i].shapes[j].showTooltip("link");
				}
			}
		}
	});
};

/**
 * Define COUNTRY module, inherit BASESHAPE
 * - Return Object:
 * {
 * 		data	: -- the same as @input 
 * 		attrs	:{
 * 					isZooming : @boolean
 * 					titleContainer {topLeft : @POINT, botRight: @POINT}
 * 					towersData:[{
 * 						center	:@POINT,
 * 						r
 * 						amount
 * 						sizeOfMaxFloor
 * 						parent
 * 						groupClass
 * 					}]
 * 				 }
 * 		shapes	:{
 * 					base: @HEXAGON
 * 					towers:[@TOWER]
 * 					title: <foreignObject>
 * 		}
 * 		parent	: -- the same as in @input
 *      group	: <g>
 * }
 */
var COUNTRY = function(input) {
	COUNTRY.parent.constructor.apply(this, arguments);
};

CONTROL.extend(COUNTRY, BASESHAPE);

//Override
COUNTRY.prototype._afterInit = function() {
	this._initBaseFloor();
	this._calculateTowerData();
	this._initTowers();
};

COUNTRY.prototype._prepareDrawing = function() {
	this._drawBaseFloor();
	this._drawTowers();
};

//-------------- DATA CALCULATION -----------------------
COUNTRY.prototype._initBaseFloor = function() {
	var baseData = {
		center : this.data.center,
		r : this.data.r,
		parent : this.group,
		groupClass : CONST.CLASS.BASE_COUNTRY,
		toolTip		: this.data.toolTip
	};

	this.shapes.base = new HEXAGON(baseData);
};

COUNTRY.prototype._calculateTowerData = function() {
	if (this.data.towers) {
		this.attrs.towersData = this._getTowerPositions();
		this._mergeTowersData();
	} else {
		this.towersData = [];
	}

};

COUNTRY.prototype._getTowerPositions = function() {
	var noOfTowers = 0;
	for (var j = 0; j < this.data.towers.length; ++j) {
		if (this.data.towers[j].amount && this.data.towers[j].amount > 0) {
			noOfTowers = noOfTowers + 1;
		}
	}
	;

	var base = this.shapes.base, allY = base.data.center.y - base.attrs.height
			/ CONST.CALCULATION.Y_OFFSET_RATIO, positions = [];

	var towerLine = this._getTowerLines(), currX = towerLine.start, step = noOfTowers > 0 ? (towerLine.end - towerLine.start)
			/ (noOfTowers)
			: 0;
	for (var i = 0; i < noOfTowers; ++i) {
		positions[i] = {
			center : new POINT(currX + (step / 2), allY)
		};
		currX = currX + step;
	}

	return positions;
};

COUNTRY.prototype._getTowerLines = function() {
	var base = this.shapes.base, start = base.attrs.shapeData.top.p3.x
			+ (base.attrs.shapeData.top.p4.x - base.attrs.shapeData.top.p3.x)
			/ 2, end = base.attrs.shapeData.top.p5.x
			+ (base.attrs.shapeData.top.p6.x - base.attrs.shapeData.top.p5.x)
			/ 2;
	return {
		start : start,
		end : end
	};
};

COUNTRY.prototype._getTowerBaseRadius = function() {
	var towerLine = this._getTowerLines(), step = this.data.maxColumns > 0 ? (towerLine.end - towerLine.start)
			/ (this.data.maxColumns) / 2
			: 0;
	return step - CONST.CALCULATION.TOWER_MARGIN;
};

COUNTRY.prototype._mergeTowersData = function() {
	var j = 0, baseR = this._getTowerBaseRadius();
	for (var i = 0; i < this.data.towers.length; ++i) {
		if (this.data.towers[i].amount > 0) {
			this.attrs.towersData[j].r = baseR;
			this.attrs.towersData[j].amount = this.data.towers[i].amount;
			this.attrs.towersData[j].toolTip =  this.data.towers[i].toolTip;
			this.attrs.towersData[j].sizeOfMaxFloor = this.data.sizeOfMaxFloor;
			this.attrs.towersData[j].parent = this.group;
			this.attrs.towersData[j].groupClass = CONST.CLASS.TOWER_GROUP + i;
			++j;
		}
	}
};

COUNTRY.prototype._initTowers = function() {
	//this should be changed
	this.shapes.towers = [];
	if (this.attrs.towersData) {
		for (var i = 0; i < this.attrs.towersData.length; ++i) {
			this.shapes.towers[i] = new TOWER(this.attrs.towersData[i]);
		}
	}
};

COUNTRY.prototype._calBoundary = function() {
	if (this.shapes) {
		var topLeft = new POINT(this.shapes.base.attrs.boundary.topLeft.x,
				this.shapes.base.attrs.boundary.topLeft.y);
		for (var i = 0; i < this.shapes.towers.length; ++i) {
			if (!topLeft.isTop(this.shapes.towers[i].attrs.boundary.topLeft)) {
				topLeft.y = this.shapes.towers[i].attrs.boundary.topLeft.y;
			}
			if (!topLeft.isLeft(this.shapes.towers[i].attrs.boundary.topLeft)) {
				topLeft.x = this.shapes.towers[i].attrs.boundary.topLeft.x;
			}
		}
		this.attrs.boundary = {
			topLeft : topLeft,
			botRight : new POINT(this.shapes.base.attrs.boundary.botRight.x,
					this.shapes.base.attrs.boundary.botRight.y)
		};
	}
};

//calculate the rectangle which will contain the title for this obj
COUNTRY.prototype._defineTitleRect = function() {
	this.attrs.titleContainer = {};
	this.attrs.titleContainer.topLeft = new POINT(
			this.shapes.base.attrs.shapeData.leftRect.p2.x,
			this.shapes.base.attrs.shapeData.leftRect.p1.y);
	this.attrs.titleContainer.botRight = new POINT(
			this.shapes.base.attrs.shapeData.leftRect.p2.x
					+ this.shapes.base.data.r,
			this.shapes.base.attrs.shapeData.botRect.p2.y);
	this.attrs.titleContainer.attrs = {
		"font-size" : "1em",
		"color" : "white"
	};
};

//-------------- DRAWING -----------------------
COUNTRY.prototype._drawBaseFloor = function() {
	this.shapes.base.draw();
};

COUNTRY.prototype._drawTowers = function() {
	if (this.shapes.towers) {
		for (var i = 0; i < this.shapes.towers.length; ++i) {
			this.shapes.towers[i].draw();
		}
	}
};

//-------------- EVENTS -----------------------
COUNTRY.prototype.addEvents = function() {
	this._onClickEvent();
};

COUNTRY.prototype._onClickEvent = function() {
	var that = this;
	d3.select(this.shapes.base.group).on("click", function() {
		if (that.attrs.isZooming != true) {
			that.zoomIn();
		} else {
			that.zoomOut();
		}

	});
};

/**
 * Define CONTINENT module, inherit BASESHAPE
 * - Return Object:
 * {
 * 		data	: -- the same as @input 
 * 		attrs	:{
 * 					boundary : {topLeft @POINT, botRight @POINT}
 * 				 }
 * 		shapes	:{
 * 				countries:[{@COUNTRY}]
 * 		}
 * 		parent	: -- the same as in @input
 *      group	: <g>
 * }
 */
var CONTINENT = function(input) {
	CONTINENT.parent.constructor.apply(this, arguments);
};

CONTROL.extend(CONTINENT, BASESHAPE);

//Override
CONTINENT.prototype._afterInit = function() {
	this._preparegroundData();
	this._sortCountries_();
};

CONTINENT.prototype._prepareDrawing = function() {
	this._drawCountries();
};

//-------------- DATA CALCULATION -----------------------
CONTINENT.prototype._preparegroundData = function() {
	var i = 0, currLeaf = 0, firstLeaf = this._getBaseData_();

	//first country
	var country = new COUNTRY(firstLeaf);
	this.shapes.countries = [];
	this.shapes.countries[0] = country;

	//others
	for (i = 1; i < this.data.countries.length; ++i) {
		var c1 = null;
		do {
			//get next relative
			var baseData = this.shapes.countries[currLeaf].shapes.base;
			c1 = baseData.getNextRelative();
			if (c1 == null) {
				++currLeaf;
			} else if (!this._notExist_(c1)) {
				baseData.setRelative(c1.position);
				c1 = null;
			}
		} while (c1 == null && currLeaf < i);

		if (c1 != null) {
			var lData = this._getBaseData_(i);
			lData.center = new POINT(c1.center.x, c1.center.y);
			var country1 = new COUNTRY(lData);
			this.shapes.countries[i] = country1;

			this.shapes.countries[currLeaf].shapes.base
					.setRelative(c1.position);
			;
			country1.shapes.base
					.setRelative([ HEXAGON.OPPOSITE_TYPE[c1.position] ]);
		}
		;
	}
	;
};

		CONTINENT.prototype._notExist_ = function(c) {
			var i = 0;
			for (i = 0; i < this.shapes.countries.length; ++i) {
				if (Math.round(c.center.x) == Math
						.round(this.shapes.countries[i].shapes.base.data.center.x)
						&& Math.round(c.center.y) == Math
								.round(this.shapes.countries[i].shapes.base.data.center.y)) {
					return false;
				}
			}
			return true;
		},

		CONTINENT.prototype._getBaseData_ = function(index) {
			if (!index) {
				index = 0;
			}
			var towerData = this.data.countries[index].towers;
			var lData = {
				center : this.data.center, //center of the COUNTRY
				title : this.data.countries[index].title,
				r : this.data.r,//radius of the base
				parent : this.group,
				groupClass : CONST.CLASS.COUNTRY_GROUP + index,
				sizeOfMaxFloor : this.data.sizeOfMaxFloor,
				maxColumns : this.data.maxColumns,//max-number of tower on the floor
				towers : towerData,
				toolTip : this.data.countries[index].toolTip
			};

			return lData;
		};

CONTINENT.prototype._sortCountries_ = function() {
	for (var i = 0; i < this.shapes.countries.length - 1; ++i) {
		for (var j = i + 1; j < this.shapes.countries.length; ++j) {
			if (this.shapes.countries[i].shapes.base
					.isLeft(this.shapes.countries[j].shapes.base)) {
				var t = this.shapes.countries[i];
				this.shapes.countries[i] = this.shapes.countries[j];
				this.shapes.countries[j] = t;
			}
		}
	}

	for (var i = 0; i < this.shapes.countries.length - 1; ++i) {
		for (var j = i + 1; j < this.shapes.countries.length; ++j) {
			if (this.shapes.countries[i].shapes.base
					.isBottom(this.shapes.countries[j].shapes.base)) {
				var t = this.shapes.countries[i];
				this.shapes.countries[i] = this.shapes.countries[j];
				this.shapes.countries[j] = t;
			}
		}
	}
};

/**
 * Calculate continent radius
 * @param r
 * @param noOfCountries
 */
CONTINENT.calculateMaxRadius = function(r, noOfCountries) {
	var radius = r;
	if (noOfCountries > 1) {
		var step = 6, i = 0, store = 1;
		while (noOfCountries > store + (step * i)) {
			radius = radius + (2 * r);
			store = store + (step * i);
			++i;
		}
		;
	}
	return radius;

};

CONTINENT.prototype._calBoundary = function() {
	if (this.shapes) {
		var topLeft = new POINT(CONST.CALCULATION.MAX_VIEW_PORT,
				CONST.CALCULATION.MAX_VIEW_PORT);
		var botRight = new POINT(0, 0);
		for (var i = 0; i < this.shapes.countries.length; ++i) {
			if (!topLeft
					.isLeft(this.shapes.countries[i].attrs.boundary.topLeft)) {
				topLeft.x = this.shapes.countries[i].attrs.boundary.topLeft.x;
			}
			if (!topLeft.isTop(this.shapes.countries[i].attrs.boundary.topLeft)) {
				topLeft.y = this.shapes.countries[i].attrs.boundary.topLeft.y;
			}
			if (botRight
					.isLeft(this.shapes.countries[i].attrs.boundary.botRight)) {
				botRight.x = this.shapes.countries[i].attrs.boundary.botRight.x;
			}
			if (botRight
					.isTop(this.shapes.countries[i].attrs.boundary.botRight)) {
				botRight.y = this.shapes.countries[i].attrs.boundary.botRight.y;
			}
		}
		this.attrs.boundary = {
			topLeft : topLeft,
			botRight : botRight
		};
	}
};

//calculate the rectangle which will contain the title for this obj
CONTINENT.prototype._defineTitleRect = function() {
	this.attrs.titleContainer = {};
	this.attrs.titleContainer.topLeft = new POINT(
			this.attrs.boundary.topLeft.x, this.attrs.boundary.botRight.y
					+ CONST.CALCULATION.DEFAULT_TITLE_MARGIN);
	this.attrs.titleContainer.botRight = new POINT(
			this.attrs.boundary.botRight.x, this.attrs.boundary.botRight.y
					+ CONST.CALCULATION.DEFAULT_TITLE_MARGIN
					+ CONST.CALCULATION.DEFAULT_TITLE_HEIGHT);
	this.attrs.titleContainer.attrs = {
		"color" : "#80B3CC"
	};
};
//-------------- DRAWING -----------------------
CONTINENT.prototype._drawCountries = function() {
	for (var i = 0; i < this.shapes.countries.length; ++i) {
		this.shapes.countries[i].draw();
	}
};

/**
 * Define LEGEND module, inherit BASESHAPE
 * - Return Object:
 * {
 * 		data	: -- the same as @input 
 * 		attrs	:{
 * 					startPoint : @POINT,
 * 					r : radius
 * 				 }
 * 		shapes	:{
 * 					legends[@HEXAGON]
 * 		}
 * 		parent	: -- the same as in @input
 *      group	: <g>
 * }
 */
var LEGEND = function(input)
{
	LEGEND.parent.constructor.apply(this,arguments); 
};

LEGEND.RADIUS_RATIO = 3;
LEGEND.OFFSET = 100;
LEGEND.MARGIN = 20;

CONTROL.extend(LEGEND,BASESHAPE);

//Override
LEGEND.prototype._afterInit = function()
{
	this._calculateStartingPoint();
	this._calculateRadius();
	this._calculateLegendData();
};

/**
 * Calculate starting point for legend
 */
LEGEND.prototype._calculateStartingPoint = function()
{
	var chartBox = this.data.chartBox;
	this.attrs.startPoint = new POINT(chartBox.botRight.x, (chartBox.botRight.y + LEGEND.OFFSET)*2);
};

LEGEND.prototype._calculateRadius = function()
{
	this.attrs.radius = this.data.rChart / LEGEND.RADIUS_RATIO;
};
/**
 * Calculate Hexagon data for legend
 */
LEGEND.prototype._calculateLegendData = function()
{
	this.shapes.legends = [];
	var center = this.attrs.startPoint;
	for (var i = this.data.legends.length-1; i >=0 ; --i)
		{
			var legendData = {
					center: center,
					r:this.attrs.radius,
					parent:this.group,
					groupClass:CONST.CLASS.LEGEND_ITEM+i,
					title : this.data.legends[i].text,
					countries : [{toolTip: this.data.legends[i].toolTip,}],
					css : {filter:"url(#"+CONST.CUSTOM_ATTRS.NEAR_SHAWDOW+")"}
			};
			this.shapes.legends.push(new CONTINENT(legendData));
			center = new POINT(center.x - this.attrs.radius*5 + this.attrs.radius,center.y);
		}
};

/**
 * Create hexagon
 */
LEGEND.prototype._prepareDrawing = function()
{
	this._drawLegend();
};

//-------------- DATA CALCULATION -----------------------
//-------------- DRAWING -----------------------
LEGEND.prototype._drawLegend = function()
{
	for (var i= 0 ; i<this.shapes.legends.length; ++i)
		{
			this.shapes.legends[i].draw();
		};
};

/**
 * Define CHART module, inherit BASESHAPE
 * - Return Object:
 * {
 * 		data	: -- the same as @input 
 * 		attrs	:{
 * 					r
 * 					titleContainer {topLeft : @POINT, botRight: @POINT}
 * 					sizeOfMaxFloor  
 * 					maxColumns // maximum number of towers
 * 					maxConInLine //no of continents on a line
// * 					width
// * 					height
 * 					continents[
 * 						{
 * 							center: @POINT,
 * 							r: --equal to data.r
 * 							parent: this.group
 * 							groupClass
 * 							sizeOfMaxFloor
 * 							maxColumns
 * 							styles
 * 							countries
 * 						}
 * 					]
 * 				 }
 * 		shapes	:{
 * 					continents:[@CONTINENT]
 * 					title: <foreignObject>
 * 		}
 * 		parent	: -- the same as in @input
 *      group	: <g>
 * }
 */
var CHART = function(input) {
	input.groupClass = CONST.CLASS.CHART_GROUP;
	CHART.parent.constructor.apply(this, arguments);
};

CONTROL.extend(CHART, BASESHAPE);

CHART.RADIUS = 100;
CHART.MARGIN = 10;
CHART.CONT_MARGIN = 100;
CHART.MAX_CONT_IN_LINE = 3;
CHART.DEFAULT_SIZE = 1000;

//Override
CHART.prototype._afterInit = function() {
	this.attrs.r = this.data.r ? this.data.r : CHART.RADIUS;
	//find sizeOfMaxFloor and maxColumns
	this._calTowerSpecifics();
	//calculate max no of continents on a line
	this._calMaxConInLine();
	//calculate continent positions
	this._calContinientPositions();
	this._prepareContinentData();
};

CHART.prototype._prepareDrawing = function() {
	this._drawContinents();
	this._prepareLegendsData();
	this._drawLegends();
};

//-------------- DATA CALCULATION -----------------------
CHART.prototype._calTowerSpecifics = function() {
	this.attrs.sizeOfMaxFloor = 0;
	this.attrs.maxColumns = 0;
	if (this.data.continents) {
		var maxAmount = 0;
		//find tower max amount
		for (var i = 0; i < this.data.continents.length; ++i) {
			for (var j = 0; j < this.data.continents[i].data.length; ++j) {
				for (var k = 0; k < this.data.continents[i].data[j].towers.length; ++k) {
					maxAmount = maxAmount < this.data.continents[i].data[j].towers[k].amount ? this.data.continents[i].data[j].towers[k].amount
							: maxAmount;
				}
				this.attrs.maxColumns = this.attrs.maxColumns > this.data.continents[i].data[j].towers.length ? this.attrs.maxColumns
						: this.data.continents[i].data[j].towers.length;
			}
		}
		while (Math.floor(maxAmount / 10) > 0) {
			maxAmount = Math.floor(maxAmount / 10);
			++this.attrs.sizeOfMaxFloor;
		}
	}

};

CHART.prototype._calMaxConInLine = function() {
	var total = this.data.continents.length;
	this.attrs.maxConInLine = 2;
	while (this.attrs.maxConInLine * (this.attrs.maxConInLine - 1) < total
			&& this.attrs.maxConInLine * this.attrs.maxConInLine < total) {
		this.attrs.maxConInLine = this.attrs.maxConInLine + 1;
	}
	;
};

CHART.prototype._calContinientPositions = function() {
	this.attrs.continents = [];
	var x = 0, y = CHART.CONT_MARGIN, //a problem will happen if the tower gets higher
	maxR = 0;
	//			this.attrs.width = x;
	//			this.attrs.height = y;
	for (var i = 0; i < this.data.continents.length; ++i) {
		var r = CONTINENT.calculateMaxRadius(this.attrs.r,
				this.data.continents[i].data.length);
		maxR = maxR < r ? r : maxR;
		x = x + r;
		var ty = y + r;
		this.attrs.continents[i] = {};
		this.attrs.continents[i].center = new POINT(x, ty);
		if ((i + 1) % this.attrs.maxConInLine == 0) {
			x = 0;
			y = y + (2 * maxR) + CHART.CONT_MARGIN + 2*CONST.CALCULATION.DEFAULT_TITLE_MARGIN;
			maxR = 0;
		} else {
			x = x + r + CHART.MARGIN;
			//							this.attrs.width = this.attrs.width < x ? x : this.attrs.width;
			//							this.attrs.height = this.attrs.height < y + (2*r) ? y +(2*r) :this.attrs.height;
		}
	}
	//			this.attrs.width = this.attrs.width + CHART.MARGIN;
	//			this.attrs.height = this.attrs.height + CHART.MARGIN;
};

CHART.prototype._prepareContinentData = function() {
	this.shapes.continents = [];
	for (var i = 0; i < this.data.continents.length; ++i) {
		this.attrs.continents[i] = {
			center : this.attrs.continents[i].center,
			r : this.attrs.r,//radius of the base
			parent : this.group,
			groupClass : CONST.CLASS.CONTINENT_GROUP + i,
			sizeOfMaxFloor : this.attrs.sizeOfMaxFloor,
			maxColumns : this.attrs.maxColumns, //max-number of tower on the floor
			styles : this.data.styles,
			countries : this.data.continents[i].data,
			title : this.data.continents[i].title,
			css : {filter:"url(#"+CONST.CUSTOM_ATTRS.NEAR_SHAWDOW+")"}
		};
		this.shapes.continents[i] = new CONTINENT(this.attrs.continents[i]);
	}
};

CHART.prototype._calBoundary = function() {
	if (this.shapes.continents && this.shapes.continents.length) {
		var topLeft = new POINT(
				this.shapes.continents[0].attrs.boundary.topLeft.x,
				this.shapes.continents[0].attrs.boundary.topLeft.y);
		var botRight = new POINT(
				this.shapes.continents[0].attrs.boundary.botRight.x,
				this.shapes.continents[0].attrs.boundary.botRight.y);
		for (var i = 1; i < this.shapes.continents.length; ++i) {
			if (!topLeft
					.isLeft(this.shapes.continents[i].attrs.boundary.topLeft)) {
				topLeft.x = this.shapes.continents[i].attrs.boundary.topLeft.x;
			}
			if (!topLeft
					.isTop(this.shapes.continents[i].attrs.boundary.topLeft)) {
				topLeft.y = this.shapes.continents[i].attrs.boundary.topLeft.y;
			}
			if (botRight
					.isLeft(this.shapes.continents[i].attrs.boundary.botRight)) {
				botRight.x = this.shapes.continents[i].attrs.boundary.botRight.x;
			}
			if (botRight
					.isTop(this.shapes.continents[i].attrs.boundary.botRight)) {
				botRight.y = this.shapes.continents[i].attrs.boundary.botRight.y;
			}
		}
		this.attrs.boundary = {
			topLeft : topLeft,
			botRight : botRight
		};
	};
};

CHART.prototype.getViewboxString = function() {
	var view = "";
	view = view + (this.attrs.boundary.topLeft.x - 2 * this.attrs.r) + " ";
	view = view
			+ (this.attrs.boundary.topLeft.y - 2*CHART.MARGIN - CONST.CALCULATION.DEFAULT_TITLE_HEIGHT)
			+ " ";
	view = view
			+ (this.attrs.boundary.topLeft
					.widthDistance(this.attrs.boundary.botRight) + 4 * this.attrs.r)
			+ " ";
	view = view
			+ (this.attrs.boundary.topLeft
					.heightDistance(this.attrs.boundary.botRight)
					+ 20 * CHART.MARGIN + this.attrs.titleContainer.topLeft
					.heightDistance(this.attrs.titleContainer.botRight));
	return view;
};

//-------------- DRAWING -----------------------
CHART.prototype._drawContinents = function() {
	for (var i = 0; i < this.shapes.continents.length; ++i) {
		this.shapes.continents[i].draw();
	};
};


/**
 * Define chart legends
 */
CHART.prototype._prepareLegendsData = function()
{
	this.shapes.legend = new LEGEND(
			{
				chartBox			: this.attrs.boundary, //chart boundary
				rChart				: this.attrs.r,//radius of the country
				parent				: this.group,
				groupClass			: CONST.CLASS.LEGEND,
				legends 			: this.data.legends
			}
			);
};

/**
 * Draw legend
 */
CHART.prototype._drawLegends = function()
{
	this.shapes.legend.draw();
};

/**
 * Create a chart inside @parentId tag
 * @param parentId
 * @param styles
 * @param data
 * @returns {CHART}
 */
CHART._createChart = function(parentId, data, styles, attrs,legends) {
	var svg = d3.select("#" + parentId).append("svg")[0][0];
	var chartData = {};

	//create chart input
	chartData.parent = svg;
	chartData.styles = styles;
	chartData.continents = data;

	chartData.title = attrs.title ? attrs.title : "";
	chartData.legends  =legends;

	//create CHART object
	var chart = new CHART(chartData);

	//adjust svg viewbox
	var cW = attrs ? (attrs.width ? attrs.width : CHART.DEFAULT_SIZE)
			: CHART.DEFAULT_SIZE, cH = attrs ? (attrs.height ? attrs.height
			: CHART.DEFAULT_SIZE) : CHART.DEFAULT_SIZE;
	d3.select(svg).attr("width", cW).attr("height", cH).attr(
			"preserveAspectRatio", "xMidYMid meet").attr("viewBox",
			chart.getViewboxString());

	return {
		svg : svg,
		chart : chart
	};
};

/**
 * Build Chart Style
 * @param noOfContinient
 * @param noOfTowers
 */
CHART.prototype.buildStyle = function(noOfContinient, noOfTowers)
{
	var styles = {};
	var len = this.shapes.continents.length;
	//build continient
	for (var i=0; i<len; ++i)
		{
			styles[CONST.CLASS.CONTINENT_GROUP+i] = {style:CHART.STYLES.CONTINIENT[i%CHART.STYLES.CONTINIENT.length]};
		}
	var len = this.attrs.maxColumns;
	//build continient
	for (var i=0; i<len; ++i)
		{
			styles[CONST.CLASS.TOWER_GROUP+i] = {style:CHART.STYLES.TOWER[i%CHART.STYLES.TOWER.length]};
			styles[CONST.CLASS.LEGEND_ITEM+i] =  {style:CHART.STYLES.TOWER[i%CHART.STYLES.TOWER.length]};
		}
	styles.group = CHART.STYLES.GROUP;
	return styles;
};

CHART.STYLES = {
		CONTINIENT : [{	fill : "#89A558", stroke : "white"},{fill : "#6f5499", stroke : "white"}
					 ,{ fill : "#7198BF", stroke : "white"},{fill : "#EC8A8B", stroke : "white"}
					 ,{ fill : "#31b0d5", stroke : "white"},{fill : "#449d44", stroke : "white"}],
		TOWER	:    [{	fill : "#149F98", stroke : "white"},{fill : "#9CC720", stroke : "white"}
					 ,{ fill : "#FF9C02", stroke : "white"},{fill : "#787878", stroke : "white"}
					 ,{ fill : "#E5CE04", stroke : "white"}],
		GROUP : {fill : "#787878",stroke : "white"},
		TITLE	: {
			"color" : "#d43f3a",
			"font-size" : "2em"
		}
};
/**
 * Create a social biz chart
 * @param id
 * @param data
 * @param chartInfo
 */
CHART.createChart = function(id, data, chartInfo) {
	var styles = chartInfo.styles;
	var frame = CHART._createChart(id, data.data, styles, chartInfo,data.legends);
	if (styles == undefined)
		{
			frame.chart.changeStyle(frame.chart.buildStyle());
		}
	frame.chart.draw();
//	frame.chart.setTitleStyle(CHART.STYLES.TITLE);
	
	//add shawdow
	CONTROL.addFiltersDef(frame.svg);
	return frame;
};