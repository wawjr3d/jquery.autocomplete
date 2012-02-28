#jQuery autocomplete plugin
I wanted to use an autocomplete but did not want to be restricted to using jquery UI's version. 

##Usage

	$().autocomplete(url|options);

##Options

####dataSource
`dataSource` can be either a string url or a an array of objects.
The data returned from the dataSource MUST be an array of objects.
What else would you want to pass?
            
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
How to display an individual result. The signature of `itemDisplay` is `item`. `item` refers to the current result's underlying raw data. 
**Default:**

	function(item) {
		return item.value;
	}

            
####itemValue
How to calculate individual result's actual value from underlying `item`. The signature of `itemValue` is `item`. `item` refers to the current result's underlying raw data.
**Default:**

	function(item) {
		return item.value;
	}

         
####filter   
How to run a search against an array of objects as a `dataSource`. The signature of `itemValue` is `item, query`. `item` refers to the current result's underlying raw data. `query` is the current text the user has input into the text field.
**Default:**

	function(item, query) {
		return item.value.toLowerCase().indexOf(query.toLowerCase()) > -1;
	}

         
####parse   
How to pull the results out of the `data` returned from a request for a url `dataSource`. 

e.g. if the results are nested like:

	{
		"search" : {
			"results" : [{}...{}]
		}
	}

then you pass

	function(data) {
		return data.search.results
	}

**Default:** `function(data) { return data; }`

            
####sort
How to sort results. `item1` and `item2` are two autocomplete results.
**Default:** `function(item1, item2) { return item1.value > item2.value; }`

##Dependencies
jQuery > v 1.7.1


##Thanks
Susanne for early testing and folks at TheLadders for code reviewing early versions