var original = document.getElementById("original");

// original.addEventListener('click',function(evt) {
// 		alert("found it!!");
// 		// evt.preventDefault();
// 		// evt.stopPropagation();
// 		this.classList.toggle("is-active");
// 		var div = document.createElement("div");
//         div.setAttribute("id","seconddiv");
//         document.querySelector("body").appendChild(div);
// 	});


var topleft = document.getElementById("topleft");
topleft.addEventListener('click',function(evt) {
	//alert("topleft");
	
	this.setAttribute("id","topleftlarge");
	//this.classList.toggle("seconddiv");
},false);
var topright = document.getElementById("topright");
topright.addEventListener('click',function(evt) {
	//alert("topright");
	this.setAttribute("id","toprightlarge");
});
var bottomleft = document.getElementById("bottomleft");
bottomleft.addEventListener('click',function(evt) {
	//alert("bottomleft");
	this.setAttribute("id","bottomleftlarge");
});
var bottomright = document.getElementById("bottomright");
bottomright.addEventListener('click',function(evt) {
	//alert("bottomright");
	this.setAttribute("id","bottomrightlarge");
});