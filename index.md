---
layout: plainvar
vim: ts=3:ft=text
style-local: true
scripts-local: true
aton: true
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

	if (VARIANTID) {
		READINGS[VARIANTID] = {};
	}
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
	// console.log("DIVS", divs);
	var data = [];
	var ps;
	var i;
	var j;
	var sources;
	var rawtext;
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
		rawtext = value;
		data[i].variant_text.push(value);
		data[i].compare_text = cleanText(value);
		ps = divs[i].querySelector("p");
		if (!ps) {
			continue;
		}
		data[i].sources = extractSourceList(ps.innerHTML);
		if (VARIANTID) {
			var vinfo = READINGS[VARIANTID];
			if (vinfo) {
				for (j=0; j<data[i].sources.length; j++) {
					vinfo[data[i].sources[j]] = rawtext;
				}
			}
		}
	}
	data = mergeSimilarVariants(data);
	content = createContent(data, cleanactive, active);
	newroot = document.querySelector("#variant_info");
	if (newroot) {
		// console.log("UPDATING OUTPUT");
		newroot.innerHTML = content;
	} else {
		console.log("CANNOT FIND #variant_info");
	}
	// console.log("OUTPUT data = ", data);
}



//////////////////////////////
//
// addVariant --
//

function addVariant(list1, list2) {
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
// putConcordancesFirst --
//

function putConcordancesFirst(a, b) {
	var testingA = a.compare_text;
	var testingB = b.compare_text;
	if (testingA === CLEANACTIVE) {
		// force concordance to top of list
		return -1;
	}
	if (testingB === CLEANACTIVE) {
		// force concordance to top of list
		return +1;
	}
	// otherwise sort by manuscript/print/setting:
	return compareSources(a.sources[0], b.sources[0]);
}



//////////////////////////////
//
// createContent --
//

var CLEANACTIVE;

function createContent(data, cleanactive, rawactive) {
	CLEANACTIVE = cleanactive;
	var output = "";
	var newdata = data.sort(putConcordancesFirst);

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
	var rawtext;
	var id;
	var nabbr;
	var popup;
	var info;
	var voice;
	var previous = "";
	for (var i=0; i<list.length; i++) {
		matches = list[i].match(/^(T[a-z][a-z]\d+[a-z]+)-(.*)/)

		if (matches) {
			voice = matches[2];
			id = list[i].replace(/-.*/, "");
			var vid = id + "-" + voice;
			// A musical setting source;
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
			popup = null;
			info = SETTINGS[id];
			if (info) {
				popup = info.CATALOGNUM + ": ";
				popup += info.COMPOSER;
				if (info.NORMPUBSHORT) {
					popup += "; " + info.NORMPUBSHORT;
				}
				if (info.PRINCEPSLOC) {
					popup += ": " + info.PRINCEPSLOC;
				}
				if (info.PRINCEPSYEAR) {
					popup += ", " + info.PRINCEPSYEAR;
				}
				if (info.PRINCEPSRISM) {
					popup += " (RISM " + info.PRINCEPSRISM + ")";
				}

				if (VARIANTID) {
					var vinfo = READINGS[VARIANTID];
					if (vinfo) {
						rawtext = vinfo[list[i]]
						if (rawtext) {
							rawtext = rawtext.replace(/["]/g, "");
							popup += '. Variant text: ' + rawtext;
						}
					}
				}

			}
			if (testp === previous) {
				entry = output[output.length-1];
				entry += '<a';
				if (popup) {
					entry += ' title="' + popup + '"';
				}
				entry += ' href="#/source/' + vid + '">';
				entry += abbr;
				if (nabbr) {
					entry += "<sub>" + nabbr + "</sub>";
				}
				entry += "</a>";
				output[output.length-1] = entry;
			} else {
				entry = testp + ":";
				entry += '<a';
				if (popup) {
					entry += ' title="' + popup + '"';
				}
				entry += ' href="#/source/' + vid + '">';
				entry += abbr;
				if (nabbr) {
					entry += "<sub>" + nabbr + "</sub>";
				}
				entry += "</a>";
				output.push(entry);
			}
			previous = testp;
		} else {
			// Either a manuscript or a print source
			popup = null;
			info = MANUSCRIPTS[list[i]];
			if (info) {
				popup = list[i] + ": " + info.SIGLUM + ", " + info.LOCATION;
				if (info.DATING) {
					popup += ", " + info.DATING;
				}
				if (info.DESCRIPTION) {
					popup += ", " + info.DESCRIPTION;
				}
				popup = popup.replace(/"/g, "");
				popup = popup.replace(/<.*?>/g, "");
			}
			if (!info) {
				info = PRINTS[list[i]];
				if (info) {
					popup = list[i] + ": " + info.PRINTTITLE;
					if (info.PUBLISHER) {
						popup += ", " + info.PUBLISHER;
					}
					if (info.PUBLOCATION) {
						popup += ", " + info.PUBLOCATION;
					}
					if (info.PUBYEAR) {
						popup += ", " + info.PUBYEAR;
					}
					popup = popup.replace(/"/g, "");
					popup = popup.replace(/<.*?>/g, "");
				}
			}

			if (popup) {
				if (VARIANTID) {
					var vinfo = READINGS[VARIANTID];
					if (vinfo) {
						rawtext = vinfo[list[i]]
						if (rawtext) {
							rawtext = rawtext.replace(/["]/g, "");
							popup += '. Variant text: ' + rawtext;
						}
					}
				}
			}

			entry = "<a ";
			if (popup) {
				entry += "title=\"" + popup + "\"";
			}
			entry += " href='#/source/" + list[i] + "'>" + list[i] + "</a>";
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
// getPopupTitleForRawVariant -- returns a title that is a list of the
//    sources that use that exact variant spelling/punctuation.
//

function getPopupTitleForRawVariant(vinfo, matchtext) {
	if (!vinfo) {
		return "";
	}
	var title = "";
	var list = [];
	var keys = Object.keys(vinfo);
	for (var j=0; j<keys.length; j++) {
		if (vinfo[keys[j]] === matchtext) {
			list.push(keys[j]);
		}
	}
	var pid;
	var id;
	var voice;
	var value;
	var matches;
	var pmatches;
	if (list.length > 0) {
		for (j=0; j<list.length; j++) {
			value = list[j];
			matches = value.match(/^(T[a-z][a-z]\d+[a-z]+)-([A-Z].*)/);
			if (matches) {
				// a musical setting.
				id = matches[1];
				voice = matches[2];
				voice = voice.replace(/[a-z_]+/g, "");

				// check if the previous entry is the same setting and
				// contract if so.
				pmatches = null;
				if (j > 0) {
					pmatches = list[j-1].match(/^(T[a-z][a-z]\d+[a-z]+)-(.*)/);
				}
				if (pmatches) {
					pid = pmatches[1];
					if (pid === id) {
						// contract with last entry
						title = title.replace(/,\s*$/, "");
						title += voice;
					} else {
						// new entry for setting
						title += id + "-" + voice;
					}
				} else {
					// new entry for setting
					title += id + "-" + voice;
				}
			} else {
				// a manuscript or a print, so no contracting of the ids:
				title += list[j];
			}
			if (j < list.length - 1) {
				title += ", ";
			}
		}
	}
	return title;
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
	var vinfo;
	if (VARIANTID) {
		vinfo = READINGS[VARIANTID];
	}

	// display exact match:
	for (i=0; i<list.length; i++) {
		if (list[i] === rawactive) {
			title = getPopupTitleForRawVariant(vinfo, list[i]);
			output += "<span";
			if (title) {	
				output += " title='" + title + "'";
			}
			output += " class='variant active'>";
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
		output += "<span";
		title = getPopupTitleForRawVariant(vinfo, list[i]);
		if (title) {	
			output += " title='" + title + "'";
		}
		if (testing === cleanactive) {
			output += " class='variant active'>";
		} else {
			output += ">";
		}
		output += list[i];
		output += "</span>";
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
	var j;
	var id;

	for (i=0; i<data.length; i++) {
		id = data[i].compare_text;
		if (!entries[id]) {
			entries[id] = data[i];
			continue;
		}
		// console.log("MERGING", data[i].variant_text[0], "WITH", id);
		entries[id] = mergeEntries(entries[id], data[i]);
	}

	var keys = Object.keys(entries);
	var output = [];
	for (i=0; i<keys.length; i++) {
		output[i] = entries[keys[i]];
	}

	// Run through the output again to deal with apostrophes:
	var pati;
	var patj;
	var rei;
	var rej;
	var mergedjs = {};
	for (i=0; i<output.length; i++) {
		if (mergedjs[i]) {
			// console.log("ALREADY MERGED, so ignore", i);
			continue;
		}
		for (j=i+1; j<output.length; j++) {
			if (mergedjs[j]) {
				// console.log("ALREADY MERGED, so ignore", j);
				continue;
			}
			pati = output[i].compare_text;
			patj = output[j].compare_text;
			rei = new RegExp('^' + pati + '$');
			rej = new RegExp('^' + patj + '$');
			if (rei.test(patj) || rej.test(pati)) {
				// console.log("STRINGS MATCH:", pati, "AND", patj);
				output[i] = mergeEntries(output[i], output[j]);
				mergedjs[j] = 1;
				output[j] = null;
			}
		}
	}

	// remove nulls from apostrophe cleaned list:
	var newoutput = [];
	for (i=0; i<output.length; i++) {
		if (!output[i]) {
			continue;
		}
		newoutput.push(output[i]);
	}
	return newoutput;
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
// cleanText -- Remove punctuation
//

function cleanText(text) {
	text = text.toLowerCase();

	// remove accents
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

	// replace spelling variants
	text = text.replace(/ & /g, " e ");   // &  => e
	text = text.replace(/\bet\b/g, "e");  // et => e
	text = text.replace(/\bhai\b/g, "ahi");
	text = text.replace(/\bh?aime\b/g, "ahime");
	text = text.replace(/\banc'?h?ora?/g, "ancora");
	text = text.replace(/\bapria\b/g, "apriva");
	text = text.replace(/\bardiva\b/g, "ardia");
	text = text.replace(/\bbeltade\b/g, "beltate");
	text = text.replace(/\bben ch'?e\b/g, "benche");
	text = text.replace(/\bch'\b/g, "che ");
	text = text.replace(/\bciel'?\b/g, "cielo ");
	text = text.replace(/\bcu?or'?e?\b/g, "cuore");
	text = text.replace(/\bin ?vano?\b/g, "invano");
	text = text.replace(/\bfra\b/g, "tra");
	text = text.replace(/\btruova\b/g, "trova");
	text = text.replace(/\bdifendia\b/g, "difenda");
	text = text.replace(/\bei\b/g, "egli");
	text = text.replace(/\bsia\b/g, "fia");
	text = text.replace(/\boltra\b/g, "oltre");
	text = text.replace(/\bonesta\b/g, "honesta");
	text = text.replace(/\bonesto\b/g, "honesto");
	text = text.replace(/\bore\b/g, "hore");
	text = text.replace(/\bod'arte\b/g, "od arte");
	text = text.replace(/\borecchi\b/g, "orecchie");
	text = text.replace(/\bgia\s+mai\b/g, "giamai");
	text = text.replace(/\borecchi\b/g, "orecchie");
	text = text.replace(/\bh?ora?'?\b/g, "ora");
	text = text.replace(/\bfacell'e\b/g, "facelle e");
	text = text.replace(/\bfacelli\b/g, "facelle");
	text = text.replace(/\bfu?oco?'?\b/g, "fuoco");
	//text = text.replace(/\bgl'\b/g, "il");
	// text = text.replace(/\ble\b/g, "il");
	text = text.replace(/\bsguardo\b/g, "guardo");
	text = text.replace(/\boh?ime\b/g, "hoime");
	text = text.replace(/\bfue?'?\s/g, "fu ");
	text = text.replace(/\bnell?e?'?\b/g, "ne le ");
	text = text.replace(/\bnell?a?'?\b/g, "ne la ");
	text = text.replace(/\bne l'?\b/g, "ne la ");  // could be "ne lo"
	text = text.replace(/\bl\b/g, "il");
	text = text.replace(/\bn\b/g, "in");
	text = text.replace(/\bl'\s\b/g, "la "); // could be "lo" as well.
	text = text.replace(/\bman'?\s/g, "mano ");
	text = text.replace(/\bm'\b/g, "mi ");
	text = text.replace(/\bn'\b/g, "ne ");
	text = text.replace(/\bprend'\b/g, "prenda ");
	text = text.replace(/\bpoi che\b/g, "poiche");
	text = text.replace(/\bper che\b/g, "perche");
	text = text.replace(/\bstrai\b/g, "strali");
	text = text.replace(/\bvedeva\b/g, "vedea");
	text = text.replace(/\bvagho\b/g, "vago");
	text = text.replace(/\bvagha\b/g, "vaga");
	text = text.replace(/\bsu?ono?'?\b/g, "suono ");
	text = text.replace(/\btal'?h?ora?\b/g, "talora ");
	text = text.replace(/\bsu?oli?'?\b/g, "suoli ");
	text = text.replace(/\bsol'?\b/g, "sole ");
	text = text.replace(/\bson'?\b/g, "sono ");
	text = text.replace(/\bsen'?\b/g, "seno ");
	text = text.replace(/\bper l'\b/g, "per lo");  // could be "per la"
	text = text.replace(/\bond'?\b/g, "onde ");
	text = text.replace(/\bh?ora?'?\b/g, "ora ");
	text = text.replace(/\bh?umile?'?\b/g, "humile "); // coule be "humile"

/*  Other spelling equivalents to think about:
	face o	fac'o	fac',o
	forza od	forz'od	forza o d'	forz'o d'	forz'od
	fossi	fussi	foss'	fuss'
	humili	umili	humil	umil	humil'	umil'
	ne gli	negli	ne gl'	negl'
	ne lo	nello	nel	nell'	ne l'	ne 'l
	nei	ne i	ne'
	non lo	no 'l
	sulla	su la	sull'	su l'
	sullo	su lo	sull'	su l'	su 'l

	// martire	martir
	//X martiri	martir
	// di	d'
	// dei	de i	de'
	// ai	a i	a'
	// bella	bell'
	// bello	bel	bell'
	// de	de'
	// de la	della	dell'	de l'
	// de lo	dello	del	dell'	de l'	de 'l

	/ desire	desir
	//X desiri	desir
	// tanto e	tant'e
	//X tanti e	tant'e
*/

	text = text.replace(/[^A-Z'’a-z<>]/g, " ");
	text = text.replace(/\s+/g, " ");
	text = text.replace(/^\s+/, "");
	text = text.replace(/\s+$/, "");

	text = text.replace(/[^\w\s'’]|(.)(?=\1)/gi, "");

	// deal with apostrophes:
	text = text.replace(/\s*['’]\s*/, ".*", "g");

	return text;
}


//////////////////////////////
//
// DOMContentLoaded event listener -- Prepare MANUSCRIPT database for popups.
//

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/rime-manuscripts.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).MANUSCRIPT;
		for (i=0; i<data.length; i++) {
			var id = data[i].SMSIGLUM;
			id = id.replace(/<.*?>/g, "");
			MANUSCRIPTS[id] = data[i];
		}
		// console.log("MANUSCRIPTS", MANUSCRIPTS);
	};
});

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/gerusalemme-manuscripts.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).MANUSCRIPT;
		for (i=0; i<data.length; i++) {
			var id = data[i].SMSIGLUM;
			id = id.replace(/<.*?>/g, "");
			MANUSCRIPTS[id] = data[i];
		}
		// console.log("MANUSCRIPTS", MANUSCRIPTS);
	};
});

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/aminta-manuscripts.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).MANUSCRIPT;
		for (i=0; i<data.length; i++) {
			var id = data[i].SMSIGLUM;
			id = id.replace(/<.*?>/g, "");
			MANUSCRIPTS[id] = data[i];
		}
		// console.log("MANUSCRIPTS", MANUSCRIPTS);
	};
});


document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/other-manuscripts.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).MANUSCRIPT;
		for (i=0; i<data.length; i++) {
			var id = data[i].SMSIGLUM;
			id = id.replace(/<.*?>/g, "");
			MANUSCRIPTS[id] = data[i];
		}
		// console.log("MANUSCRIPTS", MANUSCRIPTS);
	};
});


//////////////////////////////
//
// DOMContentLoaded event listener -- Prepare PRINTS database for popups.
//

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/rime-prints.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).PRINT;
		for (i=0; i<data.length; i++) {
			var id = "S" + data[i].SPRINTNUM;
			id = id.replace(/<.*?>/g, "");
			PRINTS[id] = data[i];
		}
		// console.log("PRINTS", PRINTS);
	};
});

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/gerusalemme-prints.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).PRINT;
		for (i=0; i<data.length; i++) {
			var id = data[i].SPRINTNUM;
			if (id.charAt(0).match(/\d/)) {
				id = "S" + data[i].SPRINTNUM;
			}
			id = id.replace(/<.*?>/g, "");
			PRINTS[id] = data[i];
		}
		// console.log("PRINTS", PRINTS);
	};
});

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/aminta-prints.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).PRINT;
		for (i=0; i<data.length; i++) {
			var id = data[i].SPRINTNUM;
			if (id.charAt(0).match(/\d/)) {
				id = "S" + data[i].SPRINTNUM;
			}
			id = id.replace(/<.*?>/g, "");
			PRINTS[id] = data[i];
		}
		// console.log("PRINTS", PRINTS);
	};
});

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/other-prints.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).PRINT;
		for (i=0; i<data.length; i++) {
			var id = data[i].SPRINTNUM;
			if (id.charAt(0).match(/\d/)) {
				id = "S" + data[i].SPRINTNUM;
			}
			id = id.replace(/<.*?>/g, "");
			PRINTS[id] = data[i];
		}
		// console.log("PRINTS", PRINTS);
	};
});



//////////////////////////////
//
// DOMContentLoaded event listener -- Prepare Rime settings database for popups.
//


document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/rime-settings.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).SETTING;
		console.log("DATA", data);
		for (i=0; i<data.length; i++) {
			var id = data[i].CATALOGNUM;
			SETTINGS[id] = data[i];
		}
		// console.log("SETTINGS", SETTINGS);
	};
});



//////////////////////////////
//
// DOMContentLoaded event listener -- Prepare Gerusalemme settings database for popups.
//

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/gerusalemme-settings.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).SETTING;
		// console.log("DATA", data);
		for (i=0; i<data.length; i++) {
			var id = data[i].CATALOGNUM;
			SETTINGS[id] = data[i];
		}
		// console.log("SETTINGS", SETTINGS);
	};
});



//////////////////////////////
//
// DOMContentLoaded event listener -- Prepare Aminta settings database for popups.
//

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/aminta-settings.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText).SETTING;
		console.log("AMINTA DATA", data);
		for (i=0; i<data.length; i++) {
			var id = data[i].CATALOGNUM;
			SETTINGS[id] = data[i];
		}
		// console.log("SETTINGS", SETTINGS);
	};
});



//////////////////////////////
//
// DOMContentLoaded event listener -- Prepare Other settings database for popups.
//

document.addEventListener("DOMContentLoaded", function() {
	var i;
	var request = new XMLHttpRequest();
	request.open("GET", "/data/indexes/other-settings.aton");
	request.send();
	request.onload = function() {
		var aton = new ATON;
		var data = aton.parse(this.responseText)
		// console.log("OTHER DATA", data).SETTING;
		for (i=0; i<data.length; i++) {
			var id = data[i].CATALOGNUM;
			SETTINGS[id] = data[i];
		}
		// console.log("SETTINGS", SETTINGS);
	};
});



var poemobserver = new MutationObserver(selectFirstVariant);
var TEI = null;

document.addEventListener("DOMContentLoaded", function() {
	TEI = document.querySelector("#TEI");
	console.log("TEI =================== ", TEI);
	poemobserver.observe(TEI, { childList: true, subtree: true })
	TEI.addEventListener("click", clickingOnVariant);
});

function clickingOnVariant(event) {
	// console.log("++++++++++ CLICK EVENT", event);
	// console.log("TARGET", event.target);
	// this is no longer used because the click event
	// is processed in the variorum.js file now.
}


var VARIANTID = null;

function selectFirstVariant() {
	var lines = TEI.querySelectorAll("tei-l");
	var segs;
	var seg;
	var i;
	var xmlid;
	var j;
	if (VARIANTID) {
		for (i=0; i<lines.length; i++) {
			var segs = lines[i].querySelectorAll("tei-seg.variant");
			for (j=0; j<segs.length; j++) {
				xmlid = segs[j].getAttribute("xml:id");
				if (xmlid === VARIANTID) {
					segs[j].click();
					return;
				}
			}
		}
	} else {
		for (i=0; i<lines.length; i++) {
			seg = lines[i].querySelector("tei-seg.variant");
			if (!seg) {
				continue;
			}
			VARIANTID = seg.getAttribute("xml:id");
			seg.click();
			return;
		}
	}

}


</script>


