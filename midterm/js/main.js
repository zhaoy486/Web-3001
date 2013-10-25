var tools = function ()
{
	function mixin(from, to)
	{
		for(var k in from) to[k] = from[k];
	}
	
	function Signal(){this.listeners = []};
	
	Signal.prototype = {
	
		add : function(callback, scope)
		{
			if(!callback)throw new Error("no callback specified");
			var args = Array.prototype.slice.call(arguments, 2);
			var n = this.listeners.length;
			for(var i = 0; i < n; i++)
			{
				var listener = this.listeners[i];
				if(listener.callback == callback && listener.scope == scope)
				{
					listener.args = args;
					return;
				}
			}
			this.listeners.push({callback:callback, scope:scope, args:args});
		},
		
		// remove : function(callback, scope)
		// {
		// 	var n = this.listeners.length;
		// 	for(var i = 0; i < n; i++)
		// 	{
		// 		var listener = this.listeners[i];
		// 		if(listener.callback == callback && listener.scope == scope)
		// 		{
		// 			this.listeners.splice(i, 1);
		// 			return;
		// 		}
		// 	}
		// },
		
		dispatch : function()
		{
			var args = Array.prototype.slice.call(arguments);
			var n = this.listeners.length;
			for(var i = 0; i < n; i++)
			{
				var listener = this.listeners[i];
				listener.callback.apply(listener.scope, args.concat(listener.args));
			}
		},
		
		dispose : function() { this.listeners = []; }
	}
	
	
	
	
	function delegate(method, scope)
	{
		if(!method)throw new Error("no method specified");
		var args = Array.prototype.slice.call(arguments, 2);
		return function()
			{
				var params = Array.prototype.slice.call(arguments);
				method.apply(scope, params.concat(args));
			}
	}
	
	
	
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
								window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
	
	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame;
	
	
	
	
	
	function Tween(duration) { this.init(duration); }
	
	Tween.prototype = {
		init : function(duration)
		{
			this.duration = duration;
			this.begin = Date.now();
		},
		valueOf : function()
		{
			return Math.min(1, (Date.now() - this.begin) / (1000 * this.duration));
		}
	}





	function Stage(w, h, addToBody)
	{
		this.canvas = document.createElement("canvas");
		this.resize(w, h);
		if(addToBody || addToBody == undefined)
		{
			var body = document.getElementsByTagName('body')[0];
			body.appendChild(this.canvas);
		}
		this.out = this.canvas.getContext("2d");
		this.onResize = new Signal();
	}
	
	Stage.prototype = {
		
		resize : function(w, h)
		{
			this.canvas.width = this.width = w;
			this.canvas.height = this.height = h;
		},
	
		autoSize : function(callback, scope)
		{
			if(callback) this.onResize.add(callback, scope);
			window.onresize = delegate(this._onResize, this);
			this._onResize();
		},
	
		_onResize : function()
		{
			this.resize(window.innerWidth || document.body.clientWidth,
						 window.innerHeight || document.body.clientHeight);
			this.onResize.dispatch();
		},
		
		clear : function()
		{
			this.out.save();
			this.out.setTransform(1, 0, 0, 1, 0, 0);
			this.out.clearRect(0, 0, this.width, this.height);
			this.out.restore();
		}
	}
	
	
	
	
	function Loop(callback, scope, autoPlay)
	{
		this.onUpdate = new Signal();
		if(callback)
		{
			this.onUpdate.add(callback, scope);
			if(autoPlay || autoPlay == undefined)
				this.play();
		}
	}

	Loop.prototype = {
	
		isPaused : true,

		play : function()
		{
			if(!this.isPaused) return;
			this.isPaused = false;
			this._onUpdate();
		},

		_onUpdate : function()
		{
			//can cause the loop to be paused
			this.onUpdate.dispatch();
			if(!this.isPaused)
				this._requestFrame = requestAnimationFrame(this._onUpdate.bind(this));
		},

		pause : function()
		{
			this.isPaused = true;
			cancelAnimationFrame(this._requestFrame);
		},
		
		dispose : function()
		{
			this.onUpdate.dispose();
			pause();
		}
	}





	function Mouse(target)
	{
		this.x = this.y = 0;
		this.oldX = this.oldY = 0;
		this.isDown = false;
		this.target = target || document;
		
		this.onDown = new Signal();
		this.onUp = new Signal();
		this.onMove = new Signal();
	
		this._moveCallback = delegate(this._onMouseMove, this);
		this._downCallback = delegate(this._onMouseDown, this);
		this._upCallback = delegate(this._onMouseUp, this);
		this.target.onmousemove = this._moveCallback;
		this.target.onmousedown = this._downCallback;
		this.target.onmouseup = this._upCallback;
	}

	Mouse.prototype = {
	
		_onMouseMove : function(e)
		{
			var ev = e || window.event;//Moz:IE
			if (ev.pageX)
			{
				//Mozilla or compatible
				this.x = ev.pageX;
				this.y = ev.pageY;
			}
			else if(ev.clientX)
			{
				//IE or compatible
				this.x = ev.clientX;
				this.y = ev.clientY
			}
			this.x -= this.target.offsetLeft 
			this.y -= this.target.offsetTop

			//synchronization problems with main loop
			//this.savePos();
			this.onMove.dispatch();
		},

		_onMouseDown : function(e)
		{
			this.isDown = true;
			this.savePos();
			this.onDown.dispatch();
		},

		_onMouseUp : function(e)
		{
			this.isDown = false;
			this.savePos();
			this.onUp.dispatch();
		},

		savePos : function()
		{
			this.oldX = this.x;
			this.oldY = this.y;
		},
		
		point : function(pt)
		{
			pt = pt || {};
			pt.x = this.x;
			pt.y = this.y;
			return pt;
		},
		
		dispose : function()
		{
			this.onDown.dispose();
			this.onUp.dispose();
			this.onMove.dispose();

			if(this.target.onmousemove == this._moveCallback)
				this.target.onmousemove = null;
			if(this.target.onmousedown == this._downCallback)
				this.target.onmousedown = null;
			if(this.target.onmouseup == this._upCallback)
				this.target.onmouseup = null;
		}
	}






	function Keyboard()
	{
		this._keys = {};
		this._preventDefaultKeys = [];
		this.onDown = new Signal();
		this.onUp = new Signal();
		this._downCallback = delegate(this._onKeyDown, this);
		this._upCallback = delegate(this._onKeyUp, this);
		document.addEventListener("keydown", this._downCallback);
		document.addEventListener("keyup", this._upCallback);
	}

	Keyboard.prototype = {

		_onKeyDown : function(e)
		{
			e = e || window.event;
			this._keys[e.keyCode] = true;
			this._call(this.onDown, e.keyCode);
		},

		_onKeyUp : function(e)
		{
			e = e || window.event;
			this._keys[e.keyCode] = false;
			this._call(this.onUp, e.keyCode);
		},
		
		_call : function(signal, keyCode)
		{
			var listeners = signal.listeners;
			var n = listeners.length;
			for(var i = 0; i < n; i++)
			{
				var listener = listeners[i];
				if(!listener.args[0])
					listener.callback.apply(listener.scope, [keyCode].concat(listener.args));
				else if(listener.args[0] == keyCode)
					listener.callback.apply(listener.scope, listener.args);
			}
		},

		isDown : function(key) { return this._keys[key] || false; },
		
		dispose : function()
		{	
			this.onDown.dispose();
			this.onUp.dispose();
			document.removeEventListener("keydown", this._downCallback);
			document.removeEventListener("keyup", this._upCallback);
		},

		preventDefault : function(keys)
		{
			if(keys) this._preventDefaultKeys = this._preventDefaultKeys.concat(keys);
			else this._preventDefaultKeys = [-1];
		},

		_doPreventDefault : function(e)
		{
			var k = this._preventDefaultKeys;
			if(k.indexOf(e.keyCode) != -1 || k[0] == -1)
				e.preventDefault();
		}
	}

	return {
			delegate:delegate,
			Stage:Stage,
			Mouse:Mouse,
			Keyboard:Keyboard,
			Tween:Tween,
			Loop:Loop,
			Signal:Signal,
			mixin:mixin,
			requestAnimationFrame:requestAnimationFrame,
			cancelAnimationFrame:cancelAnimationFrame
		};
}();

/*
tools.delegate(callback, scope);

var stage = new tools.Stage(800, 600);
var loop = new Loop(onUpdate, this);
loop.pause();
stage.width;
stage.height;
stage.out;

var mouse = new tools.Mouse(stage.canvas);
mouse.x
mouse.y
mouse.isDown
mouse.onDown.add(onMouseDown, this);
mouse.onUp.add(onMouseUp, this);

var keyboard = new tools.Keyboard();
keyboard.onDown.add(onDown, this);
keyboard.onUp.add(onKeyUp, this);
keyboard.onUp.add(onKey32Up, this, 32);
keyboard.isDown(33);*/




(function() {
	
	var w = 1024;
	var h = 768;
	var stage = new tools.Stage(w, h);
	var ctx = stage.out;
	var ran = Math.random;
	
	
	var UP = new Vector2D(0, -1);
	var DOWN = new Vector2D(0, 1);
	var LEFT = new Vector2D(-1, 0);
	var RIGHT = new Vector2D(1, 0);
	
	var CASE_A = "caseA";//0110
	var CASE_B = "caseB";//1001
	
	//this is not a Konami code, read this : http://en.wikipedia.org/wiki/Marching_squares
	var directions = [null, RIGHT, DOWN, RIGHT, UP, UP, CASE_A, UP, LEFT, CASE_B, DOWN, RIGHT, LEFT, LEFT, DOWN, null];
	var plot = [false, false, false, true, false, true, false, false, false, false, true, false, true, false, false, false];
	
	var nBalls = 8;
	var threshold = 0.4;
	var influence = 125;
	var influence2 = influence * influence;
	var influence2I = 1 / influence2;
	var sample = 1;
	
	var colorFrictionGroup = 0.1;
	var colorFrictionBall = 0.01;
	
	function createBalls()
	{
		var hue = ran() * 360;
		var sat = ran() * 0.2;
		var lig = ran() * 0.2;
		var balls = [];
		for(var i = 0; i < nBalls; i++)
		{
			var ball = new Metaball();
			ball.x = ran() * w;
			ball.y = ran() * h;
			balls.push(ball);
		}
		return balls;
	}
	
	function vectorizeMetaballs(balls)
	{
		//console.log("vectorizeMetaballs");
		var groups = groupBalls(balls);
		
		var begin = new Vector2D();
		var current = new Vector2D();
		var nGroups = groups.length;
		var paths = [];
		for(var i = 0; i < nGroups; i++)
		{
			var g = groups[i];
			begin.x = Math.floor(g.top.x);
			begin.y = Math.floor(g.top.y);
			
			findStartPoint(begin, sample, g);
			current.x = begin.x;
			current.y = begin.y;
			
			var path = [];
			paths.push(path);
			path.nBalls = g.length;
			
			var limit = 300;
			var oldDirection = RIGHT;
			var iteration = 0;
			var plotted = false;
			do
			{
				
				//http://en.wikipedia.org/wiki/Marching_squares
				var id = thresholdValue(getMBValue(current.x - sample, current.y - sample, g), threshold) << 3;
				id |= thresholdValue(getMBValue(current.x + sample, current.y - sample, g), threshold) << 2;
				id |= thresholdValue(getMBValue(current.x - sample, current.y + sample, g), threshold) << 1;
				id |= thresholdValue(getMBValue(current.x + sample, current.y + sample, g), threshold);
				
				
				var direction = directions[id];
				if(plot[id] && !plotted)
					path.push(new Vector2D(current.x, current.y));
				else if(!plot[id] && plotted)
					path.push(new Vector2D(current.x - sample * oldDirection.x, current.y - sample * oldDirection.y));
				plotted = plot[id];
				
				//drawSquare(current.x, current.y, id);
				
				if(direction == CASE_A)
				{
					if(thresholdValue(getMBValue(current.x, current.y, g), threshold))
					{
						if(oldDirection == RIGHT)direction = UP;
						else if(oldDirection == LEFT)direction = DOWN;
					}
					else
					{
						if(oldDirection == RIGHT)direction = DOWN;
						else if(oldDirection == LEFT)direction = UP;
					}
				}
				else if(direction == CASE_B)
				{
					if(thresholdValue(getMBValue(current.x, current.y, g), threshold))
					{
						if(oldDirection == DOWN)direction = RIGHT;
						else if(oldDirection == UP)direction = LEFT;
					}
					else
					{
						if(oldDirection == DOWN)direction = LEFT;
						else if(oldDirection == UP)direction = RIGHT;
					}
				}
				else if(!direction) continue;//throw "you should not be here";
				
				current.x += direction.x * sample;
				current.y += direction.y * sample;
				oldDirection = direction;
				//if(--limit<0)break;
			}
			while(current.x != begin.x || (current.y != begin.y && Math.abs(current.y - begin.y) > sample))
			//last condition avoids spirals
		}
		return paths;
	}
	
	/**
	* find the point at witch
	*/
	function findStartPoint(pos, sample, group)
	{
		//console.log("findStartPoint");
		var val1, val2
		do
		{
			val1 = thresholdValue(getMBValue(pos.x, pos.y + sample, group), threshold);
			val2 = thresholdValue(getMBValue(pos.x, pos.y - sample, group), threshold);
			if(val1 == val2 && val1 == 0)
			{
				pos.y += sample;
				break;
			}
			pos.y -= sample;
		}
		while(val1 == 1 && val2 == 1)
	}
	
	
	/**
	* 
	*/
	function getMBValue(x, y, group)
	{
		//console.log("getMBValue");
		var n = group.length;
		var val = 0;
		for(var i = 0; i < n; i++)
		{
			var b = group[i];
			var dx = b.x - x;
			var dy = b.y - y;
			var r2 = dx * dx + dy * dy;
			r2 *= influence2I;
			if(r2 < 1)
				val += (1 - r2) * (1 - r2);
		}
		return val;
	}
	
	function thresholdValue(value, t) {return value > t ? 1 : 0; }
	
	
	/**
	* identifiy how the balls are related to each other
	*/
	function groupBalls(balls)
	{
		//console.log("groupBalls");
		var groups = [];
		for(var i = 0; i < nBalls; i++)
		{
			var ballA = balls[i];
			ballA.group = null;
			for(var j = 0; j < i; j++)
			{
				var ballB = balls[j];
				if(ballA.group == ballB.group)continue;
				var dx = ballB.x - ballA.x;
				var dy = ballB.y - ballA.y;
				
				//if balls are in the same group (at this point ballB is always in a group)
				if(dx * dx + dy * dy < 2 * influence2)
				{
					var a = ballA.group;
					var b = ballB.group;
					if(b && a)
					{
						//console.log("merge groups, b.length", b.length);
						//if a is already in a group, merge the groups
						for(var k = 0; k < b.length; k++)
						{
							a.push(b[k]);
							b[k].group = a;
							if(b[k].y < a.top.y) a.top = b[k];
						}
						groups.splice(groups.indexOf(b), 1);
					}
					else if(b)
					{
						//else add ballA to ballB's group
						b.push(ballA);
						ballA.group = b;
					}
				}
			}
			
			//if ballA doesn't belong to any previously created group,
			//a new group containing ballA is created
			if(!ballA.group)
				groups.push(ballA.group = [ballA]);
			
			if(!ballA.group.top || ballA.y < ballA.group.top.y)
				ballA.group.top = ballA;
		}
		//console.log("balls grouped", groups.length);
		return groups;
	}
	
	/**
	* marching squares debug
	* draw a square
	*/
	// paths
	
	/**
	* draw the metaballs
	*/
	function draw(paths)
	{
		var nPaths = paths.length;
		for(var j = 0; j < paths.length; j++)
		{
			var path = paths[j];
			if(!path[0])continue;
			var nPts = path.length;
      
			var nLines = 1;
			for(var k = 0; k < nLines; k++)
			{
				var pt = new Vector2D(path[0].x, path[0].y);
				var opt = new Vector2D(path[0].x, path[0].y);
				ctx.beginPath();
				ctx.moveTo(pt.x - 0.5, pt.y - 0.5);
				for(var i = 1; i < nPts; i++)
				{
					pt.x = path[i].x;// + 2 * (ran() * 2 - 1);
					pt.y = path[i].y;// + 2 * (ran() * 2 - 1);
					ctx.quadraticCurveTo(opt.x - 1, opt.y - 1, (pt.x + opt.x) * 1, (pt.y + opt.y) * 1);

					opt.x = pt.x;
					opt.y = pt.y;
				}
				ctx.closePath();
				ctx.strokeStyle = "rgba(0, 100, 0, 1)";
				ctx.stroke();
				if(k == 0)
				{
					c = path.color;
					ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
					ctx.fill();
				}
			}
		}
	}
	
	var balls;
	var fr = 0.99;
	function go()
	{
		balls = createBalls();
		//console.log("balls", balls);
		//drawBalls(balls);
		new tools.Loop(update);}
	
	function update()
	{
		ctx.clearRect(0, 0, w, h);//clean up the background
		ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
		for(var i = 0; i < nBalls; i++)
		{
			var ball = balls[i];
			ball.vx = ball.vx * fr + 0.2 * (ran() * 2 - 1);
			ball.vy = ball.vy * fr + 0.2 * (ran() * 2 - 1);
			ball.x += ball.vx;
			ball.y += ball.vy;
			if(ball.x < influence)
			{
				ball.x = influence;
				ball.vx *= -1;
			}
			else if(ball.x > w - influence)
			{
				ball.x = w - influence;
				ball.vx *= -1;
			}
			if(ball.y < influence)
			{
				ball.y = influence;
				ball.vy *= -1;
			}
			else if(ball.y > h - influence)
			{
				ball.y = h - influence;
				ball.vy *= -1;
			}
		}
		var paths = vectorizeMetaballs(balls);
		ctx.clearRect(0, 0, w, h);
		draw(paths);
	}
	
	
	go();
	
	

	function Metaball()
	{
		this.group = null;
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.trueColor = null;
		this.color = null;
	}


	function Vector2D(x, y)
	{
		this.x = x;
		this.y = y;
	}
	

	
	
})();


