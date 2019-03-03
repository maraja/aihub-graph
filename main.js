$(document).ready(function() {
  var test = false;
  var easter = false;

  var nodes = [];
  var edges = [];

  var index_to_nodes = {};
  var nodes_to_index = {};

  var adjacency_list = {};

  var add_node_form = document.forms.add_node;
  var add_edge_form = document.forms.add_edge;
  var num_steps_form = document.forms.num_steps;
  var nodelist = document.getElementById("nodelist");
  var edgelist = document.getElementById("edgelist");

  if (test) {
    adjacency_list = {
      amit: ["veronica", "jairam", "nanda"],
      veronica: ["seema", "beenu"],
      anandi: ["amit", "jairam", "nanda"],
      jairam: ["nanda", "amit", "anandi"],
      nanda: ["jairam", "amit", "anandi"],
      seema: ["beenu"],
      beenu: ["seema"]
    };
    buildGraph();
  }

  add_node_form.addEventListener("submit", function(e) {
    e.preventDefault();
    var person = add_node_form.name.value;
    add_node_form.name.value = "";
    rebuildNodes(person);
    // console.log(person);
  });

  add_edge_form.addEventListener("submit", function(e) {
    e.preventDefault();
    var node_from = add_edge_form.edge_from.value;
    var node_to = add_edge_form.edge_to.value;

    if (!!!node_to || !!!node_from) alert("incomplete form");
    rebuildEdges(node_from, node_to);
    // node_from.value = "";
    node_to = "";
    // console.log(person);
  });

  num_steps_form.addEventListener("submit", function(e) {
    e.preventDefault();
    var num_steps = num_steps_form.steps.value;
    var person_from = num_steps_form.person_from.value;
    var person_to = num_steps_form.person_to.value;

    if (!!!person_from || !!!person_to || !!!num_steps)
      alert("incomplete form");
    num_steps.value = "";
    person_from.value = "";
    person_to.value = "";
    var [
      listObject,
      adjacencyMatrix,
      index_to_name,
      name_to_index
    ] = getAdjacencyMatrix(adjacency_list);
    Swal.fire(
      "Paths from " +
        person_from +
        " to " +
        person_to +
        " with " +
        num_steps +
        " step(s): " +
        getNumberOfSteps(
          adjacencyMatrix,
          num_steps - 1,
          person_from,
          person_to,
          name_to_index
        )
    );
    // console.log(person);
  });

  function rebuildNodes(name) {
    nodes.push(name);

    index_to_nodes[nodes.length] = name;
    nodes_to_index[name] = nodes.length;

    console.log(index_to_nodes);
    console.log(nodes_to_index);

    adjacency_list[name] = [];
    node_html = "";
    for (var key in adjacency_list) {
      node_html +=
        "<p>" +
        nodes_to_index[key] +
        ". " +
        key +
        ": " +
        adjacency_list[key] +
        "</p>";
    }
    // nodes.forEach((name, index) => {
    // });
    nodelist.innerHTML = node_html;
  }

  function rebuildEdges(node_from, node_to) {
    nodes.push(name);

    // index_to_nodes[nodes.length] = name;
    // nodes_to_index[name] = nodes.length;

    // console.log(index_to_nodes);
    // console.log(nodes_to_index);

    if (
      !!!adjacency_list[index_to_nodes[node_from]] ||
      !!!adjacency_list[index_to_nodes[node_to]]
    ) {
      alert("invalid information entered.");
      return;
    }

    adjacency_list[index_to_nodes[node_from]].push(index_to_nodes[node_to]);
    node_html = "";
    for (var key in adjacency_list) {
      node_html +=
        "<p>" +
        nodes_to_index[key] +
        ". " +
        key +
        ": " +
        adjacency_list[key] +
        "</p>";
    }
    // nodes.forEach((name, index) => {
    // });
    nodelist.innerHTML = node_html;
  }

  document
    .getElementById("build-graph-btn")
    .addEventListener("click", buildGraph);

  function buildGraph() {
    hideForms();
    initGraph();
  }

  function hideForms() {
    document.getElementById("build-graph-btn").style.display = "none";
    add_node_form.style.display = "none";
    add_edge_form.style.display = "none";
  }

  function findPaths() {}

  function initGraph() {
    document.getElementById("graph-stuff").style.display = "block";
    var elements = [];
    Object.keys(adjacency_list).forEach(name => {
      var degree = 0;
      // find the in-degree for the node.
      for (var key in adjacency_list) {
        degree += adjacency_list[key].filter(n => n == name).length
      }
      elements.push({
        data: {
          id: name,
          score: adjacency_list[name].length,
          // add the in-degree to the out degree
          size: (adjacency_list[name].length + degree + 1) * 12
        }
      });
      adjacency_list[name].forEach(edge => {
        elements.push({
          data: {
            id: name + "-" + edge,
            source: name,
            target: edge
          }
        });
      });
    });

    let options = {
      name: "circle",

      fit: true, // whether to fit the viewport to the graph
      padding: 100, // the padding on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      radius: undefined, // the radius of the circle
      startAngle: (3 / 2) * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function(node, i) {
        return true;
      }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function(node, position) {
        return position;
      } // transform a given node position. Useful for changing flow direction in discrete layouts
    };

    var cy = cytoscape({
      container: document.getElementById("graph"), // container to render in

      elements: elements,

      style: [
        // the stylesheet for the graph
        {
          selector: "core",
          style: {
            "selection-box-color": "#AAD8FF",
            "selection-box-border-color": "#8BB0D0",
            "selection-box-opacity": "0.5"
          }
        },
        {
          selector: "node",
          style: {
            width: "data(size)",
            height: "data(size)",
            "background-color": "#017953",
            // shape: "circle",
            content: "data(id)",
            "font-size": "20px",
            "text-valign": "center",
            "text-halign": "center",
            "background-color": "#017953",
            "text-outline-color": "#017953",
            "text-outline-width": "6px",
            color: "#fff",
            "overlay-padding": "6px",
            "z-index": "10"
          }
        },

        {
          selector: "edge",
          style: {
            opacity: 0.5,
            width: 10,
            "line-color": "#666",
            "target-arrow-color": "#666",
            "curve-style": "bezier",
            "target-arrow-shape": "triangle"
          }
        }
      ],

      layout: options
    });

    // turn off zoom
    cy.zoomingEnabled(false);

    // calculateBetweenness(cy, "amit");
    // calculateCloseness(cy, "amit");
    // calulateDegreeCentrality(cy, "amit");


    var [
      listObject,
      adjacencyMatrix,
      index_to_name,
      name_to_index
    ] = getAdjacencyMatrix(adjacency_list);

    console.log(
      "Opportunities from amit to veronica with 3 steps:",
      getNumberOfSteps(adjacencyMatrix, 3, "amit", "veronica", name_to_index)
    );


    var influentialPerson="", popularPerson = "";
    var influentialPersonBetweenness=0, popularPersonCentrality = 0;
    Object.keys(name_to_index).forEach(person => {
      if (calculateBetweenness(cy, person) > influentialPersonBetweenness) {
        influentialPerson = person;
        influentialPersonBetweenness = calculateBetweenness(cy, person);
      }
      if (calulateDegreeCentrality(cy, person) > popularPersonCentrality) {
        popularPerson = person;
        popularPersonCentrality = calulateDegreeCentrality(cy, person);
      }
    })


    $("#graph-stats").append($('<p/>', {
      text: "Person with the highest betweenness: " + influentialPerson + " with a betweenness score of " + influentialPersonBetweenness
    }))
    $("#graph-stats").append($('<p/>', {
      text: "Person with the highest degree centraility: " + popularPerson + " with a betweenness score of " + popularPersonCentrality
    }))
    // alert("the most influential person is " + influentialPerson + " with a betweenness score of " + influentialPersonBetweenness)

    // console.log(listObject);
    // console.table(adjacencyMatrix);
    // console.table(
    //   multiplyMatricesByCount(adjacencyMatrix, adjacencyMatrix, 0, 0)
    // );
    // console.table(
    //   multiplyMatricesByCount(adjacencyMatrix, adjacencyMatrix, 0, 1)
    // );
    // console.table(
    //   multiplyMatricesByCount(adjacencyMatrix, adjacencyMatrix, 0, 2)
    // );
    // console.table(
    //   multiplyMatricesByCount(adjacencyMatrix, adjacencyMatrix, 0, 3)
    // );
  }

  function getAdjacencyMatrix(list) {
    // get the list object from the function
    var listObject = getAdjacencyMatrixAsObject(list);
    var final = [];
    for (var key in listObject) {
      final.push(Object.values(listObject[key]));
    }

    return [
      listObject,
      final,
      index_to_name(listObject),
      name_to_index(listObject)
    ];
  }

  function getNumberOfSteps(
    adjacencyMatrix,
    numSteps,
    name_from,
    name_to,
    name_to_index
  ) {
    return multiplyMatricesByCount(
      adjacencyMatrix,
      adjacencyMatrix,
      0,
      numSteps
    )[name_to_index[name_from]][name_to_index[name_to]];
  }

  function calculateBetweenness(cy, node) {
    console.log(
      "Betweenness for",
      node,
      ":",
      cy.$().bc().betweenness("#" + node.toString())
    );
    return cy.$().bc().betweenness("#" + node.toString())
  }

  function calculateCloseness(cy, node) {
    console.log(
      "Closeness for",
      node,
      ":",
      cy.$().cc({ root: "#" + node.toString() })
    );
  }

  function calulateDegreeCentrality(cy, node) {
    console.log(
      "Degree Centrality for:",
      node,
      ":",
      cy.$().dc({ root: "#" + node.toString() }).degree
    );
    return cy.$().dc({ root: "#" + node.toString() }).degree;
  }

  // helpers

  function multiplyMatrices(m1, m2) {
    var result = [];
    for (var i = 0; i < m1.length; i++) {
      result[i] = [];
      for (var j = 0; j < m2[0].length; j++) {
        var sum = 0;
        for (var k = 0; k < m1[0].length; k++) {
          sum += m1[i][k] * m2[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  function multiplyMatricesByCount(m1, m2, count, maxCount) {
    if (count < maxCount)
      return multiplyMatricesByCount(
        m1,
        multiplyMatrices(m1, m2),
        count + 1,
        maxCount
      );
    else return m2;
    //   var outputMatrix = multiplyMatrices(m1, m2);
  }

  function getAdjacencyMatrixAsObject(list) {
    var final = {};
    for (var x in list) {
      final[x] = {};
      for (var y in list) {
        final[x][y] = 0;
      }
      list[x].forEach(function(z) {
        final[x][z]++;
      });
    }
    return final;
  }

  function index_to_name(list) {
    var map = {};
    var count = 0;
    for (var key in list) {
      map[count] = key;
      count++;
    }
    return map;
  }

  function name_to_index(list) {
    var map = {};
    var count = 0;
    for (var key in list) {
      map[key] = count;
      count++;
    }
    return map;
  }
});
