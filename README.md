#jQuery autocomplete plugin
I wanted to use an autocomplete but did not want to be restricted to using jquery UI's version. 

##Usage
Include jQuery, then include the autocomplete, e.g.

	<script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="js/jquery.autocomplete.js"></script>
	
then call the autocomplete on a jQuery-fied input 

	$("input").autocomplete(url|options);
	
**Note:** Only the first element in the result of the jQuery selector will be turned into an autocomplete. Chaining will be maintained, but only for that first element. For example, with the following code:

	<input type="text" name="textbox1">
	<input type="text" name="textbox2">
	
	<script type="text/javascript">
		$("input").autocomplete("dummy.json").css("background", "blue");
	</script>

Only "textbox1" will become an autocomplete and have its background turned to blue.

##Options

####dataSource
`dataSource` can be either a string url or a variable.
Either the result of calling `parse` (covered below) on the `dataSource` or the `data` returned from a url MUST be an array.
            
####queryParam
If `dataSource` is url, the parameter that will be the search term.
**Default:** "q"


####extraParams
Any extra parameters that you want to pass to the url `dataSource`.
**Default:** `{}`


####minimumCharacters
Minimum number of characters before retrieving results.
**Default:** 3
          
            
####delay
Time (milliseconds) to wait after user types to go get data.
**Default:** 400
            
            
####limit
Number of results to display.
**Default:** 10


####showFailure
Whether or not to show a `failureMessage` when there are no results.
**Default:** true

            
####failureMessage
**Default:** "No results found."
            
            
####itemDisplay
How to display an individual result. The signature of `itemDisplay` is `item`.
`item` refers to the current result's underlying raw data. 
**Default:**

	function(item) {
		return item.value;
	}

            
####itemValue
How to calculate individual result's actual value from underlying `item`.
The signature of `itemValue` is `item`. `item` refers to the current result's underlying raw data.
**Default:**

	function(item) {
		return item.value;
	}

         
####filter   
When `dataSource` is an array, the `filter` function tells the autocomplete how to use your `query` to filter the array.
The signature of `filter` is `value, query`. `value` is the value of the current `item` as determined by the `itemValue` function.
`query` is the current text the user has input into the text field.
**Default:**

	function(value, query) {
		return value.toLowerCase().indexOf(query.toLowerCase()) > -1;
	}

         
####parse   
The `parse` function tells the autocomplete how to extract the results from the JSON object returned from a request to the url.
*Note:* the `parse` function will be applied whether `dataSource` is a url or an array. 

e.g. if the results are nested like:

	{
		"search" : {
			"results" : [{}...{}]
		}
	}

then `parse` should be

	function(data) {
		return data.search.results
	}

**Default:** `function(data) { return data; }`

            
####sort
The strategy for sorting the results. `item1` and `item2` are two items in the list of results.
**Default:** `function(item1, item2) { return item1.value > item2.value; }`


##Events
You can subscribe to a few useful events. After an input becomes an autocomplete, you will always be able to attach handlers to the following events.

####autocomplete:open
When the results element opens.
	
	$("input").bind("autocomplete:open", function(e) {
		console.log("autocomplete open");
	});

####autocomplete:close
When the results element closes.

	$("input").bind("autocomplete:close", function(e) {
		console.log("autocomplete closed");
	});

####autocomplete:search
When a search begins. When it fires, this event passes the `query` that was input.

	$("input").bind("autocomplete:search", function(e, query) {
		console.log("autocomplete search for '" + query + "'");
	});

####autocomplete:search:complete
When a search completes. When it fires, this event passes an object containing the `results` of the search. The results can be extracted by calling `results.results`.

	$("input").bind("autocomplete:search:complete", function(e, results) {
		console.log("autocomplete returned results");
		console.log(results.results);
	});

####autocomplete:item:highlighted
When an item in the list of results is highlighted. This event passes the data `item` that was highlighted.

	$("input").bind("autocomplete:item:highlighted", function(e, item) {
		console.log("autocomplete highlighted an item");
		console.log(item);
	});

####autocomplete:item:selected
When an item in the list of results is selected. This event passes the data `item` that was selected.

	$("input").bind("autocomplete:item:selected", function(e) {
	
	});


##Dependencies
jQuery


##Thanks
Susanne for early testing and folks at TheLadders for code reviewing early versions