
	window.JSONtoTable	= function(json,selector) {
		var table	= document.createElement('table');
		var thead	= document.createElement('thead');
		tfoot	= document.createElement('tfoot');
		var tr		= [];
		tr.push(document.createElement('tr'));
		//var td	= document.createElement('th');
		//td.classList.add('blank');
		//$(tr[tr.length-1]).append(td);
		if ( Array.isArray(json) )
			for ( var i in json[0] ) {
				var td	= document.createElement('th');
				td.textContent	= i;
				$(tr[tr.length-1]).append(td)
			}
		$(thead).append(tr[0]);
		$(tfoot).append($(tr[0]).clone());
		$(table).append(thead);

		var tbody	= document.createElement('tbody');
		for ( var i in json ) {
			tr.push(document.createElement('tr'));
			tr[tr.length-1].classList.add(j);
			tr[tr.length-1].setAttribute('name',i);
			for ( var j in json[i] )  {
				//this._tableControlCell(tr[tr.length-1]);
				var td	= document.createElement('td');
				$(td).attr('name',j);
				td.textContent	= json[i][j];
				$(tr[tr.length-1]).append(td);
			}
			$(tbody).append(tr[tr.length-1]);
		}
		$(table).append(tbody);
		$(selector).append(table);
	};