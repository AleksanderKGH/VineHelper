
class Grid {
	pGrid = null;
	pArrTile = [];

	constructor(obj) {
		this.pGrid = obj;
	}
	
	getId() {
		return $(this.pGrid).attr("id");
	}

	getDOM () {
		return this.pGrid;
	}

	addTile(t) {
		this.pArrTile.push(t);

		if(!$.isEmptyObject(t)){
			$(t.getDOM()).detach().appendTo("#" + this.getId());
			$(t.getDOM()).show();
		}
	}

	async removeTile(t, animate = false) {
		$.each(this.pArrTile, function (key, value) {
			if (value != undefined && value.getAsin() == t.getAsin()) {
				this.pArrTile.splice(key, 1);
			}
		}.bind(this));

		if(animate)
			await t.animateVanish(); //Will hide the tile
	}

	getTileCount (trueCount = false) {
		if (trueCount)
			return $(this.pGrid).children().length;
		else
			return this.pArrTile.length;
	}

	getTileId (asin) {
		var r = null;
		$.each(this.pArrTile, function (key, value) {
			if (value != undefined && value.getAsin() == asin) {
				r = value;
				return false; //Stop the loop
			}
		});
		return r;
	}
}



function updateTileCounts(){
	//Calculate how many tiles within each grids
	if(appSettings.unavailableTab.active || appSettings.hiddenTab.active)
		$("#ext-helper-available-count").text(gridRegular.getTileCount(true));
	
	if(appSettings.unavailableTab.active)
		$("#ext-helper-unavailable-count").text(gridUnavailable.getTileCount(true));
	
	if(appSettings.hiddenTab.active)
		$("#ext-helper-hidden-count").text(gridHidden.getTileCount(true));
}



async function createGridInterface(){
	//Clean up interface (in case of the extension being reloaded)
	$("ul#ext-helper-tabs-ul").remove();
	$("div#tab-unavailable").remove();
	$("div#tab-hidden").remove();
	$(".ext-helper-status").remove(); //remove all toolbars
	
	//Implement the tab system.
	let tabs = $("<div>").attr("id","ext-helper-tabs").insertBefore("#vvp-items-grid");
	$("#vvp-items-grid").detach().appendTo(tabs);

	let tplTabs = await Tpl.loadFile("view/tabs.html");

	//If voting system enabled
	if(appSettings.unavailableTab.active){
		Tpl.setIf("unavailable", true);
		
		$("<div />")
			.attr("id","tab-unavailable")
			.addClass("ext-helper-grid")
			.appendTo(tabs);
	}
	
	//If the hidden tab system is activated
	if(appSettings.hiddenTab.active){
		Tpl.setIf("hidden", true);
		$("<div />")
			.attr("id","tab-hidden")
			.addClass("ext-helper-grid")
			.appendTo(tabs);
	}

	let tabsHtml = Tpl.render(tplTabs);
	$(tabs).prepend(tabsHtml);
	
	if(appSettings.hiddenTab.active){
		//Add the toolbar for Hide All & Show All
		//Delete the previous one if any exist:
		$("#ext-helper-tabs .hidden-toolbar").remove();
		//Generate the html for the hide all and show all widget
		let prom = await Tpl.loadFile("view/widget_hideall.html");
		let content = Tpl.render(prom);
		$(content).prependTo("#ext-helper-tabs");
		$(content).appendTo("#ext-helper-tabs").css("margin-top", "5px");

		$("#ext-helper-hideall").on("click", {}, this.hideAllItems);
		$("#ext-helper-showall").on("click", {}, this.showAllItems);
		
	}
	
	//Actiate the tab system
	$( "#ext-helper-tabs" ).tabs();
	
}


async function hideAllItems(){
	if ($("#vvp-items-grid .vvp-item-tile").children().length == 0)
		return true;
	
	tDom = $("#vvp-items-grid .vvp-item-tile").children()[0];
	asin = getAsinFromDom(tDom);
	tile = getTileByAsin(asin); //Obtain the real tile 
	await tile.hideTile(false);
	
	hideAllItems();
}

async function showAllItems(){
	if ($("#tab-hidden .vvp-item-tile").children().length == 0)
		return true;
	
	tDom = $("#tab-hidden .vvp-item-tile").children()[0];
	asin = getAsinFromDom(tDom);
	tile = getTileByAsin(asin); //Obtain the real tile 
	await tile.showTile(false);
	
	showAllItems();
}