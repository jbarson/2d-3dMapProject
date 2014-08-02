/**
 * Created by Jon on 2014-08-02.
 */
var app= angular.module('mapSetup',[]);
app.controller('mapController',['$scope',function($scope){
  // a snippit that returns an array of objects describing a node map suitable for a wargaming campaign map.
  var myMap=[];
  $scope.numberOfPlayers= 5;
  $scope.nodesPerPlayer= 15;
  $scope.numberOfNodes = $scope.numberOfPlayers * $scope.nodesPerPlayer;
  $scope.jsonInput=null;
  $scope.clearDisplay=function(){
    $scope.jsonInput=null;
  };
  $scope.outputJson = function(){
    console.log(myMap);
    if(myMap.length>0){
      $scope.jsonInput = JSON.stringify(myMap);
    }
    $scope.apply();
  };
  $scope.generate=function(){
    if(!$scope.jsonInput){
      myMap =  populateMap(names);
    }else{
      myMap = JSON.parse($scope.jsonInput);
    }
    nodeAndLinks = {"nodes": [], "links": []};

    for (var i=0; i < myMap.length; i ++){
      var system = myMap[i];
      nodeAndLinks.nodes.push(new Node(system));
      for (var a=0; a < system.links.length; a++){
        if (system.links[a] > system.id){
          nodeAndLinks.links.push( new Link(system.id, system.links[a] ));
        }
      }
    }

    $('svg').remove();
    init();

  };
  //console.log(angular.element('#container'))
//System is a constructor function for the System objects.
  function System(id, name, brown, green, yellow, linkNo){
    this.id = id;  //A unique id given to this system, it will normally correspond with the system's index in the map array.
    this.name = name;
    this.brown = brown; //Does the system have a brown resource?
    this.green = green; //does it have a grean resource?
    this.yellow = yellow;
    this.linkNo = linkNo; //what is the maximum number of links this system can support
    this.links = []; //an array holding all the links.
  }

//doesn't do much yet
  System.prototype.display = function(){
    alert("System " + this.id + ": " + this.name);
    return this;
  };

//connects systems together
  function defineLinks(thisMap){
    for (var i = 0; i < thisMap.length; i++) {
      //connects the current system with the next system.
      if (i < thisMap.length-1){
        thisMap[i].links.push(i+1);
        thisMap[i+1].links.push(i);
      }

      if (i < thisMap.length-2){
        for (var a = i+2; a < thisMap.length && thisMap[i].links.length < thisMap[i].linkNo; a ++){
          //connects the current system with sysems up to linksNo that have not yet been connected.
          if (thisMap[a].links.length === 0){
            thisMap[i].links.push(a);
            thisMap[a].links.push(i);
          }
        }
      }
    }
    //lets look for stars with only 2 links
    var target;

    for (var  j in thisMap){
      if (thisMap[j].links.length===2){
        //console.log(thisMap[j].links);
        thisMap[j].links.push(thisMap[j].links[0]-1);
        //console.log(thisMap[j].links);
        //console.log(j);
        thisMap[thisMap[j].links[0]-1].links.push(parseInt(j,10));
        // console.log(thisMap[thisMap[j].links[0]-1].links);

      }
    }
    return thisMap;
  }

  function populateMap(names){
    var thisMap = [];
    for (var i = 0; i < names.length; i++) {
      thisMap.push(new System(i, names[i], true, true, true, Math.floor(3 + Math.random()*7) ));
    }
    defineLinks(thisMap);
    return thisMap;
  }

  var names = [];
  for (var i = 0; i<60; i++){
    names.push(i);
  }

  myMap =  populateMap(names);

  function Node(system){
    this.name = system.name;
    this.group = system.links.length;
  }

  function Link(source, target){
    this.source = source;
    this.target = target;
    this.value = 1;
  }

  var nodeAndLinks = {"nodes": [], "links": []};

  for (var i=0; i < myMap.length; i ++){
    var system = myMap[i];
    nodeAndLinks.nodes.push(new Node(system));
    for (var a=0; a < system.links.length; a++){
      if (system.links[a] > system.id){
        nodeAndLinks.links.push( new Link(system.id, system.links[a] ));
      }
    }
  }





//D3 Starts Here.

  var init=function(){
    //angular.element('svg').remove();
    var width = 960,
      height = 500;

    var color = d3.scale.category20();

    var force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([width, height])
      .nodes(nodeAndLinks.nodes)
      .links(nodeAndLinks.links)
      .start();

    var svg = d3.select("#container").append("svg")
      .attr("width", width)
      .attr("height", height);

    var link = svg.selectAll(".link")
      .data(nodeAndLinks.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.selectAll(".node")
      .data(nodeAndLinks.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

    node.append("title")
      .text(function(d) { return d.name; });



    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    });

  };
  //init();
}]);
