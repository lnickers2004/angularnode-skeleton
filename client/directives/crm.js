dependencies	= ['api', '$q', '$http', '$interval'];
link	= function($scope) {
	$.fn.dataTable.ext.search.push(
	    function( settings, data, dataIndex ) {
	        var state = $('#state').val();
	        var inState = data[7];
	 		if ( state.length == 0 )
	 			return true;
	 		console.log(inState);
	 		return state.toUpperCase()==inState.toUpperCase();
	    }
	);
 
	$http({method: 'GET', url: '/api/?q='+JSON.stringify({'cmd': 'getSampleData'})}).success(function(res){
		JSONtoTable(JSON.parse(res.message),'#example');
		$('#example table').addClass('display');
		table	= $('#example table').DataTable({
			"lengthMenu":[10,20,50],
			"responsive":true
		});

		$('#state').keyup(function(){
			table.draw();
		})
	});
	
}