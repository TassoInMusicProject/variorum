---
layout: plainvar
vim: ts=3
style-local: true
scripts-local: true
permalink: /variorum/index.html
---

<div class="container-fluid">


	<div class="row">

		<!-- div class="col-sm-3 col-md-2 sidebar" id="select_source" -->
		<div class="col-sm-3 col-md-2" id="select_source">
			<div style="height:50px"></div>

			<h4>Literary Manuscripts</h4>
			<ul class="nav nav-sidebar" id="lit_ms"> </ul>

			<h4>Literary Prints</h4>
			<ul class="nav nav-sidebar" id="lit_p"></ul>

			<h4>Musical Sources</h4>
			<ul class="nav nav-sidebar" id="mus"></ul>
		</div>

		<div class="col-sm-6 col-sm-offset-3 col-md-8 col-md-offset-2 main" id="TEI"></div>

		<!-- div class="col-sm-3 col-sm-offset-9 col-md-2 col-md-offset-10 sidebar" -->
		<div id="vinfo" class="col-sm-3 col-sm-offset-9 col-md-2 col-md-offset-10">
			<h4 style="display:none;">Variant info</h4>
			<div id="variant_info"></div>
			<div style="display:none;" id="variant_info1"></div>
		</div>

	</div>
</div>


<script>


function adjustVariants() {

	var active = document.querySelector("tei-seg.variant.active");
	var cleanactive = "";
	if (active) {
		active = active.textContent;
		cleanactive = cleanText(active);
	} else {
		active = null;
		cleanactive = null;
	}

	var newroot = document.querySelector("#variant_info");
	var root = document.querySelector("div#variant_info1");
	if (!root) {
		console.log("NO VARIANT INFO");
		if (newroot) {
			newroot.innerHTML = "";
		} 
		return;
	}
	var divs = root.querySelectorAll("div");
	if (divs.length == 0) {
		console.log("DID NOT FIND ANY DIFFs in DIV");
		if (newroot) {
			newroot.innerHTML = "";
		} 
		return;
	}
	console.log("DIVS", divs);
	var data = [];
	var ps;
	var i;
	var sources;
	var pieces;
	for (i=0; i<divs.length; i++) {
		data[i] = {};
		ps = divs[i].querySelectorAll("p.variant_text");
		if (ps.length == 0) {
			continue;
		}
		data[i].variant_text = [];
		var value = ps[0].textContent;
		// Remove punctuation at the end of the string
		value = value.replace(/[:;,.?!]\s*$/, "");
		data[i].variant_text.push(value);
		data[i].compare_text = cleanText(value);
		ps = divs[i].querySelector("p");
		if (!ps) {
			continue;
		}
		
		data[i].sources = extractSourceList(ps.innerHTML);
		
	}
	data = mergeSimilarVariants(data);
	content = createContent(data, cleanactive, active);
	newroot = document.querySelector("#variant_info");
	if (newroot) {
		console.log("UPDATING OUTPUT");
		newroot.innerHTML = content;
	} else {
		console.log("CANNOT FIND #variant_info");
	}
	console.log("OUTPUT data = ", data);
}



//////////////////////////////
//
// addVariant --
//

function addVariant(list1, list2) {
console.log("LIST1", list1, "LIST2", list2);
	var found;
	var i;
	var j;
	var output = [];
	for (i=0; i<list1.length; i++) {
		output.push(list1[i]);
	}

	for (i=0; i<list2.length; i++) {
		found = 0;
		for (j=0; j<list1.length; j++) {
			if (list1[j] === list2[i]) {
				found = 1;
				break;
			}
		}
		if (!found) {
			output.push(list2[i]);
		}
	}
	output = output.sort(function(a, b) { 
		return a.toLowerCase().localeCompare(b.toLowerCase(),  'en')});
	return output;
}



//////////////////////////////
//
// extractSourceList --
//

function extractSourceList(text) {
	//	pieces = text.split(/\s*,\s*/);
	var matches = text.match(/(?<=\/source\/)([^"]+)(?=">)/g);
	if (!matches) {
		return [];
	}
	var output = matches;
	return output;
}



//////////////////////////////
//
// createContent --
//

function createContent(data, cleanactive, rawactive) {
	var output = "";
	var newdata = data.sort(function(a, b) {
		var testingA = a.compare_text;
		var testingB = b.compare_text;
		if (testingA == cleanactive) {
			return +1;
		}
		if (testingB == cleanactive) {
			return +1;
		}
		return compareSources(a.sources[0], b.sources[0]);
	});

	var start = 0;
	output += "<h1>Concordances</h1>";
	if (newdata[start].compare_text == cleanactive) {
		output += createEntryText(newdata[0], cleanactive, rawactive);
		start++;
	} else {
		output += "<h2>None</h2>";
		output += "<hr/>";
	}

	output += "<h1>Variants</h1> ";

	if (start == newdata.length) {
		output += "<h2>None</h2>";
	} else {
		for (var i=start; i<newdata.length; i++) {
			output += createEntryText(newdata[i], cleanactive, rawactive);
		}
	}
	return output;
}




//////////////////////////////
//
// createEntryText --
//

function createEntryText(entry, cleanactive, rawactive) {
	var output = "";
	output += "<div>";
	output += "<p>";
	output += createSourceList(entry.sources);
	output += "</p>";
	output += "<p class='variant_text'>";
	output += createVariantText(entry.variant_text, cleanactive, rawactive);
	output += "</p>";
	output += "<hr/>";
	output += "</div>";
	return output;
}



//////////////////////////////
//
// createSourceList --
//


function createSourceList(list) {
	var newlist = sortSourceList(list);
	var clist = compactList(newlist);
	var output = "";
	for (var i=0; i<clist.length; i++) {
		output += clist[i];
		if (i < clist.length - 1) {
			output += ", ";
		}
	}
	return output;
}



//////////////////////////////
//
// compactList --
//

function compactList(list) {
	var output = [];
	var matches;
	var entry;
	var testp;;
	var name;
	var abbr;
	var nabbr;
	var previous = "";
	for (var i=0; i<list.length; i++) {
		matches = list[i].match(/^(T[a-z][a-z]\d+[a-z]+)-(.*)/)
		if (matches) {
			testp = matches[1];
			name = matches[2];
			matches = name.match(/^([A-Z])/);
			if (matches) {
				abbr = matches[1];
			} else {
				abbr = "X";
			}
			matches = name.match(/_(.*)/);
			if (matches) {
				nabbr = matches[1];
			} else {
				nabbr = "";
			}
			if (testp === previous) {
				entry = output[output.length-1];
				entry += "<a href='#/source/" + list[i] + "'>";
				entry += abbr;
				if (nabbr) {
					entry += "<sub>" + nabbr + "</sub>";
				}
				entry += "</a>";
				output[output.length-1] = entry;
			} else {
				entry = testp + ":";
				entry += "<a href='#/source/" + list[i] + "'>";
				entry += abbr;
				if (nabbr) {
					entry += "<sub>" + nabbr + "</sub>";
				}
				entry += "</a>";
				output.push(entry);
			}
			previous = testp;
		} else {
			entry = "<a href'#/source/" + list[i] + "'>" + list[i] + "</a>";
			output.push(entry);
		}
	}

	return output;
}



//////////////////////////////
//
// sortSourceList --
//

function sortSourceList(list) {
	return list.sort(function(a, b) { return compareSources(a, b); });
}


//////////////////////////////
//
// compareSources --
//

function compareSources(a, b) {
		var atype = 0;
		var btype = 0;

		if (a.match(/^S\d+$/)) {
			atype = 2;
		} else if (a.match(/^T[a-z]{2}\d+/)) {
			atype = 3;
		} else {
			atype = 1;
		}

		if (b.match(/^S\d+$/)) {
			btype = 2;
		} else if (b.match(/^T[a-z]{2}\d+/)) {
			btype = 3;
		} else {
			btype = 1;
		}

		if (atype > btype) {
			return +1;
		} else if (atype < btype) {
			return -1;
		}

		var matchesA = a.match(/^(T[a-z][a-z]\d+[a-z]+)-(.*)/);
		var matchesB = b.match(/^(T[a-z][a-z]\d+[a-z]+)-(.*)/);
		if (matchesA && matchesB) {
			var idA = matchesA[1];
			var idB = matchesB[1];
			if (idA > idB) {
				return 1;
			} else if (idA < idB) {
				return -1;
			}
			// the IDs are the same so sort by instrument;
			var nameA = matchesA[1];
			var nameB = matchesB[1];
			var testA = 0;
			var testB = 0;

			if      (nameA.match(/Cant/i))    { testA = 1; }
			else if (nameA.match(/Alt/i))     { testA = 2; }
			else if (nameA.match(/Tenor/i))   { testA = 3; }
			else if (nameA.match(/Bass/i))    { testA = 4; }
			else if (nameA.match(/Quint/i))   { testA = 5; }
			else if (nameA.match(/Sest/i))    { testA = 6; }
			else if (nameA.match(/Sept/i))    { testA = 7; }
			else if (nameA.match(/Ott/i))     { testA = 8; }
			else if (nameA.match(/Non/i))     { testA = 9; }
			else if (nameA.match(/^Deci/i))   { testA = 10; }
			matchesA = nameA.match(/_(\d)/);
			if (matchesA) {
				testA += parseInt(matchesA[1])/10.0;
			}
			// 11 and 12 also in one case

			if      (nameB.match(/Cant/i))    { testB = 1; }
			else if (nameB.match(/Alt/i))     { testB = 2; }
			else if (nameB.match(/Tenor/i))   { testB = 3; }
			else if (nameB.match(/Bass/i))    { testB = 4; }
			else if (nameB.match(/Quint/i))   { testB = 5; }
			else if (nameB.match(/Sest/i))    { testB = 6; }
			else if (nameB.match(/Sept/i))    { testB = 7; }
			else if (nameB.match(/Ott/i))     { testB = 8; }
			else if (nameB.match(/Non/i))     { testB = 9; }
			else if (nameB.match(/^Deci/i))   { testB = 10; }
			matchesB = nameB.match(/_(\d)/);
			if (matchesB) {
				testB += parseInt(matchesB[1])/10.0;
			}
			// 11 and 12 also in one case

			if (testA > testB) { return 1; }
			if (testA < testB) { return -1; }
			return 0;
		}

		var pmatchA = a.match(/^S(\d+)/);
		var pmatchB = a.match(/^S(\d+)/);
		if (pmatchA && pmatchB) {
			var valueA = parseInt(pmatchA[1]);
			var valueB = parseInt(pmatchB[1]);
			if (valueA < valueB) {
				return -1;
			} else if (valueA < valueB) {
				return +1;
			} else {
				return 0;
			}
		}

		return a.localeCompare(b);
	}




//////////////////////////////
//
// createVariantText --
//

function createVariantText(list, cleanactive, rawactive) {
	var output = "";
	var testing;
	var best = "";
	var i;

	// display exact match:
	for (i=0; i<list.length; i++) {
		if (list[i] === rawactive) {
			output += "<span class='variant active'>";
			output += list[i];
			output += "</span>";
			output += "<br/>";
		}
	}

	// display non-exact matches:
	for (i=0; i<list.length; i++) {
		if (list[i] === rawactive) {
			continue;
		}
		testing = cleanText(list[i]);
		if (testing === cleanactive) {
			output += "<span class='variant active'>";
			output += list[i];
			output += "</span>";
		} else {
			output += list[i];
		}
		if (i < list.length - 1) {
			output += "<br/>";
		}	
	}

	return output;
}


var observer = new MutationObserver(adjustVariants);
var node = document.querySelector("div#variant_info1");
if (node) {
	console.log("OBSERVING NODE", node);
	observer.observe(node, { childList: true, subtree: true })
} else {
	console.log("NODE IS ", node);
}



//////////////////////////////
//
// mergeSimilarVariants --
//

function mergeSimilarVariants(data) {
	var entries = {};
	var i;
	var id;

	for (i=0; i<data.length; i++) {
		id = data[i].compare_text;
		if (!entries[id]) {
			entries[id] = data[i];
			continue;
		}
		console.log("MERGING", data[i].variant_text[0], "WITH", id);
		entries[id] = mergeEntries(entries[id], data[i]);
	}
	var keys = Object.keys(entries);
	var output = [];
	for (i=0; i<keys.length; i++) {
		output[i] = entries[keys[i]];
	}
	return output;
}



//////////////////////////////
//
// mergeEntries --
//

function mergeEntries(obj1, obj2) {
	// obj1.variant_text = obj1.variant_text.concat(obj2.variant_text);
	obj1.variant_text = addVariant(obj1.variant_text, obj2.variant_text);
	obj1.sources = obj1.sources.concat(obj2.sources);
	return obj1;
}



//////////////////////////////
//
// cleanText -- Remvoe punctionation
//

function cleanText(text) {
	text = text.toLowerCase();
	text = text.replace(/ & /g, " e ");   // &  => e
	text = text.replace(/\bet\b/g, "e");  // et => e

	text = text.replace(/é/g, "e");
	text = text.replace(/è/g, "e");
	text = text.replace(/ó/g, "o");
	text = text.replace(/ò/g, "o");
	text = text.replace(/í/g, "i");
	text = text.replace(/ì/g, "i");
	text = text.replace(/ú/g, "u");
	text = text.replace(/ù/g, "u");
	text = text.replace(/á/g, "a");
	text = text.replace(/à/g, "a");

	text = text.replace(/[^A-Za-z'<>]/g, " ");
	text = text.replace(/\s+/g, " ");
	text = text.replace(/^\s+/, "");
	text = text.replace(/\s+$/, "");

	text = text.replace(/[^\w\s]|(.)(?=\1)/gi, "");

	return text;
}



</script>


