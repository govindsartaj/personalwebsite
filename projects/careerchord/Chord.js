/***************************************
 * Authors:                            *
 * David Hanle                         *
 * Toby Baratta                        *
 *                                     *
 * Last updated Nov 15, 2019           *
 *                                     *
 * Modified from code provided by      *
 * Michael Bostick on his website      *
 * https://d3js.org/ and their GitHub   *
 * https://github.com/mbostock/d3/     *
 ***************************************/

var allGroups = [];

function appendName(dataset) {

    "use strict";
    /* Use the filename as the title */
    var h = document.createElement("H1");

    document.body.appendChild(h);
}

function appendSource(source) {

    "use strict";

    var p = document.createElement("p"),
        t = document.createTextNode("Data Source | " + source),
        z = document.createTextNode("Data Analysis and Social Inquiry Lab | Created by Toby Baratta '17 and David Hanle '14. Modified by Jemuel Santos '19 and Govind Brahmanyapura '21."),
        lastUpdatetdP = document.createElement("p"),
        lastUpdated = document.createTextNode("Last Updated : November 14, 2019");

    document.body.appendChild(p);
    p.appendChild(t);
    document.body.appendChild(z);
    document.body.appendChild(lastUpdatetdP);
    lastUpdatetdP.appendChild(lastUpdated);
}

function createGraph(dataset, parse) {

    appendName(dataset);

    "use strict";

    /* Reads in and parses the JSON into a giant matrix asynchronously */
    d3.json(dataset + ".json", function (error, raw) {
        if (error) { /* Handle errors when reading the file */
            return console.warn(error);
        }
        parse(raw); /* Send the one matrix to get parsed into the appropriate matrices and arrays */
    });
}

function chordParse(raw) {

    "use strict";

    var i, j, k,
        rows = raw[0].length, /* The number of rows in the matrix */
        matrix = [], /* Holds the data */
        labels = [], /* Holds the group labels */
        extra = [raw[rows], raw[rows + 1]]; /* Extract the clarifying words and data source */

    /* Parse appropriate rows into the labels array */
    for (i = 0; i < rows; i++) {
        if (typeof (raw[i][i]) !== "number") { /* Still a row of labels */
            labels[i] = raw[i];
        }
        else {
            break;
        }
    }

    /* Parse the appropriate cells into the matrix 2d array */
    for (j = i; j < rows; j++) {
        matrix[j - i] = [];
        for (k = i; k < rows; k++) {
            matrix[j - i][k - i] = raw[j][k];
        }
    }

    /* Graph it */
    createChord(labels, matrix, rows, extra);
}

var careerIndex = new Array();

function createChord(labels, matrix, rows, extra) {

    "use strict";

    // console.log(extra[0]);
    var appendArcs,
        chords,
        fill,
        groups,
        layout,
        names,
        svg,
        layers = labels.length, /* The number of annuli around the chords */
        height = screen.height*0.8, /* Height of svg element */
        width = screen.width*0.9, /* Width of svg element */
        innerRadius = Math.min(width, height) * 0.33, /* Inner radius of the the first annulus */
        thickness = Math.min(width, height) * 0.35 - innerRadius; /* Thickness of each annulus */

    /*Initialize the chord layout*/
    layout = d3.layout.chord()
        .padding(0.02) /*Sets the space between groups to an angle in radians*/
        .sortSubgroups(d3.descending) /*Graphs the data within each group in some order*/
        .matrix(matrix); /*Sets the input data matrix for this chord diagram*/

    /*Defines the colors used in the chord diagram*/
    fill = ["rgb(0,0,0)","rgb(255,0,0)","rgb(128,0,32)","rgb(64,224,208)","rgb(65,105,225)",
        "rgb(0,0,255)","rgb(255,69,0)","rgb(0,0,128)","rgb(138,43,226)","rgb(0,128,128)","rgb(0,128,0)",
        "rgb(107,142,35)","rgb(247,223,7)","rgb(204,119,34)","rgb(222,49,99)","rgb(97,51,47)",
        "rgb(158,253,56)","rgb(128,128,128)","rgb(247,223,7)","rgb(0,0,0)","rgb(255,0,0)",
        "rgb(255,69,0)","rgb(128,0,32)","rgb(0,0,128)","rgb(138,43,226)","rgb(0,0,255)",
        "rgb(64,224,208)","rgb(0,128,128)","rgb(204,119,34)","rgb(107, 142, 35)",
        "rgb(62,180,137)","rgb(0,128,0)","rgb(65,105,225)","rgb(222,49,99)","rgb(97,51,47)"]

    /*Append SVG element*/
    svg = d3.select(".viz").append("svg")
        .attr("width", screen.width*1.1) /*Set its width*/
        .attr("height", screen.height) /*Set its height*/
        .append("g") /*The g element groups objects together*/
        .style("font-size","14px")
        .attr("transform", "translate(" + width / 2.7 + "," + height / 2 + ")"); /*Center the SVG element*/

    appendArcs = svg.selectAll("g");

    groups = appendArcs
        .data(layout.groups)
        .enter().append("g");


    /* Draw the chords */
    chords = svg.selectAll(".chord")
        .data(layout.chords)
        .enter().append("path")
        .attr("class", "chord")
        .style("fill", function (d) { return fill[d.target.index]; })
        .style("stroke", function(d){ return fill[d.target.index ]; })
        .attr("d", d3.svg.chord().radius(innerRadius));

    chords.append("title")
        .text(function (d) {
            var percentage = [d.target.value * 100 / groups[0][d.target.index].__data__.value,
                    d.source.value * 100 / groups[0][d.source.index].__data__.value],
                text = labels[layers - 1][d.target.index + layers]
                    // '!'   is the separator
                    + "!"
                    + labels[layers - 1][d.source.index + layers]
                    + "!"
                    + ": "
                    + " (" + percentage[0].toFixed(1) + "%)";
            /* Store all of the possible texts into an array as they are created */
            careerIndex.push(text);
            return text;
        });

    allGroups = labels[1].slice(2);

    /* Tooltip SVG */
    var tooltip = d3.select(".viz").append("svg")
        .attr("width", screen.width/2) /*Set its width*/
        .attr("height", screen.height) /*Set its height*/
        .append("g") /*The g element groups objects together*/
        .style("font-size", "14px")
        .attr("transform", "translate(" + screen.width*1.03 + "," + screen.height*1.2 + ")");

    /* Store texts by their label in their own array index */
    // this is kind of slow--O(n^2) time complexity; try to make faster?
    var textHolder = [];
    for(var i = 0; i < labels[1].length; i++) {
        textHolder[i] = [];
        for(var j = 0; j < careerIndex.length; j++) {
            // labels holds all of the majors and career areas
            // so we use it to check if the given label is in the text we stored
            // and if so, we store it in its own array index
            // each array index will then hold all texts with the given label
            if(careerIndex[j].includes(labels[1][i])) {
                textHolder[i].push(careerIndex[j]);
            }
        }
    }

    /* Remove other texts which have the word other but is not relevant. */
    textHolder[17].splice(0, 33);

    /* Sort the texts alphabetically */
    for(let i = 0; i < textHolder.length; i++) {
        textHolder[i].sort();
    }

    // Fixes bug that caused Arts and Entertainment career stats to appear
    //    alongside Art major data
    for(let c=0; c < textHolder[28].length; c++) {
        if (textHolder[28][c].includes("Arts and Entertainment")) {
            textHolder[28].splice(c,c);
        }
    }

    // remove buggy text that just does not seem to go away
    textHolder[28].splice(0, 1);

    // remove redundancies in tooltip text
    for(let i = 0; i < textHolder.length; i++) {

        let dupl1 = textHolder[i][0].split('!')[0];
        let dupl2 = textHolder[i][1].split('!')[0];

        if (dupl1 === dupl2){
            for (let j=0; j < textHolder[i].length; j++) {
                textHolder[i][j] = textHolder[i][j].split('!')[1] + textHolder[i][j].split('!')[2];
            }
        }

        else{
            for (let j=0; j < textHolder[i].length; j++) {
                textHolder[i][j] = textHolder[i][j].split('!')[0] + textHolder[i][j].split('!')[2];
            }
        }
    }

    /* Draw the annulus */

    groups.append("path") /* For each group, append a path */
        .style("fill", function (d, i) { return fill[i]; }) /* Define the fill color by the index of the group object */
        .style("stroke", function (d, i) { return fill[i]; }) /* Define the border color */
        .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(innerRadius + thickness)) /* Define and draw the path as an arc */
        .on("click", fade(0.1, chords, groups, textHolder, tooltip)); /*Click fade events*/ // Set opacity to be 0.

    // groups.append("title")
    //     .text(function (d, i) {
    //         return labels[layers - 1][i + layers] + " - "
    //             + "Total " + extra[0][0] + ": "
    //             + Math.round(d.value).toLocaleString() + " " + labels[0][0];
    //     })
    //     .attr('font-family', 'sans-serif');


    names = groups.append("text")
        .text(function (d, i) {
            return labels[layers - 1][i + layers];})
        .attr('font-family', 'sans-serif')
        .attr("transform", function (d) { return moveText(innerRadius + thickness, (d.startAngle + d.endAngle) / 2, this.getBBox().width); });


    if (layers > 1) {
        graphSupergroups(rows, labels[0], innerRadius, thickness, layout, appendArcs, fill, names, chords);
    }

    appendSource(extra[1]);
}


function graphSupergroups(rows, labels, innerRadius, thickness, layout, appendArcs, fill, names, chords) {

    "use strict";

    var curlabel,
        i = 2,
        j = 0,
        startpos,
        superData = [],
        supergroups;

    names.style("opacity", 0);

    while (i < rows) {
        curlabel = labels[i];
        startpos = i;
        while (curlabel === labels[i]) {
            i++;
        }
        superData[j] = {innerRadius: innerRadius + thickness + 5, outerRadius: innerRadius + 2 * thickness + 5, startAngle: layout.groups()[startpos - 2].startAngle, endAngle: layout.groups()[i - 3].endAngle, text: curlabel, index: j, startIndex: startpos - 2, endIndex: i - 3};
        j++;
    }
    supergroups = appendArcs
        .data(superData)
        .enter().append("g");

    supergroups.append("path")
        .style("fill", function (d) { return fill[d.index]; })
        .style("stroke", function (d) { return fill[d.index]; })
        .attr("d", d3.svg.arc())
        .on("click", expand);

    // Changes titles for supergroups
    supergroups.append("text")
        .text(function (d) { return d.text; })
        .attr('font-family', 'sans-serif')
        .attr("transform", function (d) { return moveText(d.outerRadius, (d.startAngle + d.endAngle) / 2, this.getBBox().width); });

    /* Function that expands the arcs and reveals the labels */
    function expand(d, i) {

        var arc = d3.select(this),
            eIndex = superData[i].endIndex,
            opacity = [],
            sIndex = superData[i].startIndex;

        if (d.innerRadius === innerRadius + thickness + 5) {
            superData[i].innerRadius += 100;
            superData[i].outerRadius += 100;
            opacity[0] = 1;
            opacity[1] = 0.2; // Opacity is set to be 0, outer circle will disappear once click it
            opacity[2] = 0;
        }
        else {
            superData[i].innerRadius = innerRadius + thickness + 5;
            superData[i].outerRadius = innerRadius + 2 * thickness + 5;
            opacity[0] = 0;
            opacity[1] = 1;
            opacity[2] = 1;
        }
        names.filter(function (d, i) { return sIndex <= i && i <= eIndex; }) // set opacity for the labels of inner arc
            .transition()
            .style("opacity", opacity[0]);
        arc.transition() // set the opacity for outer arc
            .attr("d", d3.svg.arc())
            .style("opacity", opacity[1]);
        d3.select(supergroups[0][i]).select("text").transition().style("opacity", opacity[2]);
    }
}

// This var will be used to keep track of whether something is currently
// clicked on. This is to avoid bugs that happen when multiple careers/majors are
// turned on.
var lastClicked = -1;
/* Returns an event handler for fading a given chord group */
function fade(opacity, chords, groups, textHolder, tooltip) {
    return function (g, i) {
        if (lastClicked === i){
            chords.filter(function (d) {
                return true;
            })
                .style("opacity", 1);
            tooltip.selectAll('*').remove();
            lastClicked = -1;
            return;
        }

        lastClicked = i;
        // resets opacity to 1 for all chords
        chords.filter(function (d) {
            return true;
        })
            .style("opacity", 1);

        chords.filter(function (d) {
            return d.source.index !== i && d.target.index !== i;
        })
            .style("opacity", opacity);

        // clear tooltip text
        tooltip.selectAll('*').remove();

        // console.log(allGroups[i]);
        /* Append the relevant texts into the tooltip */

        if (i <= 15) {
            tooltip.append('text')
                .text("Majors of alumni who work in: ")
                .attr('x', -screen.width)
                .attr('y', -screen.height + 15);

            tooltip.append('text')
                .text(allGroups[i])
                .attr('x', -screen.width)
                .attr('y', -screen.height + 30);
        }
        else{
            tooltip.append('text')
                .text("Career areas of alumni who majored in: ")
                .attr('x', -screen.width)
                .attr('y', -screen.height + 15)

            tooltip.append('text')
                .text(allGroups[i])
                .attr('x', -screen.width)
                .attr('y', -screen.height + 30);

        }
        for (var j = 0; j < textHolder[i + 2].length; j++) {
            tooltip.append('text')
                .attr('x', -screen.width)
                .attr('y', (j * 15.5) - screen.height + 65)
                .attr('font-family', 'sans-serif')
                .text(textHolder[i + 2][j]);
        }
    };
}

/* Returns an event handler for fading a given chord group */
// function superFade(opacity, chords, superData) {
//     return function (g, i) {
//         var eIndex = superData[i].endIndex,
//             sIndex = superData[i].startIndex;
//         chords.filter(function (d) { return (d.source.index < sIndex || d.source.index > eIndex) && (d.target.index < sIndex || d.target.index > eIndex); })
//             .style("opacity", opacity);
//     };
// }

/* Function that moves text away from a point at a given angle */
function moveText(distance, angle, textWidth) {
    /* Calculate the distance to move horizontally and vertically */
    var horizontal = 1.03 * distance * Math.sin(angle),
        vertical = -1.05 * distance * Math.cos(angle);

    /* Text has to be moved farther out if it is being moved to the left */
    if (angle > Math.PI)
        horizontal = horizontal - textWidth;

    return "translate(" + horizontal + "," + vertical + ")";
}
