/*
 * TODO: heavily refactor!
 * 
 * 
 */
(function($, undefined) {

	var selectedClass = "selected",
		
		// keys
		KEYLEFT = 37,
		KEYUP = 38,
		KEYRIGHT = 39,
		KEYDOWN = 40,
		ENTER_KEY = 13;
		
    
    $.fn.autocomplete = function(options) {

        var defaultOptions = {
            
            /*
             * DataSource can be either a string url or a an array of objects.
             * The data returned from the dataSource MUST be an array of objects.
             * What else would you want to pass?
             */
            dataSource: "",
            
            /*
             * If dataSource is url, the parameter that will be the search term 
             */
            queryParam: "q",
            
            /*
             * any extra parameters that you want to pass to the url dataSource
             */
            extraParams: {},
            
            /*
             * minimum number of characters before retrieving results
             */
            minimumCharacters: 3,
            
            /*
             * time to wait after user types to go get data
             */
            delay: 400,
            
            /*
             * number of results to display
             */
            limit: 10,
            
            /*
             * whether or not to show a failure message when there are no results
             */            
            showFailure: true,
            
            failureMessage: "No results found.",
            
            /*
             * how to display an individual result from data item
             */
            itemDisplay: function(item) {
                return item.value;
            },
            
            /*
             * how to calculate input's actual value from data item
             */
            itemValue: function(item) {
                return item.value;
            },
            
            /*
             * how to run a search against an array of objects as a dataSource
             */
            filter: function(item, query) {
                return item.value.toLowerCase().indexOf(query.toLowerCase()) > -1;
            },
            
            /*
             * how to pull the results out of the data returned from a request for a url dataSource
             * e.g. if the results are nested like 
             * 
             * {
             *      "search" : {
             *          "results" : [{}...{}]
             *      }
             * }
             * 
             * then you pass
             *   
             * function(data) {
             *      return data.search.results
             * }
             *
             */
            parse: function(data) {
                return data;
            },
            
            /*
             * how to sort results
             */
            sort: function(item1, item2) {
                return item1.value > item2.value;
            }
        };
        
        if (typeof options === "string") { options = { dataSource: options }; }
        
        var settings = $.extend(defaultOptions, options);
        
        var isDataSourceUrl = typeof settings.dataSource == "string"; // hopefully this is a url
         
        
        /*
         * There will only be one result div because
         * only 1 autocomplete needs to be open at any given time.
         * I was going to do one per instance but until there's
         * a specific use case for it, it's probably better to just
         * keep the added markup minimal
         */
        var $results = $("#autocomplete-results");
        
        if ($results.size() == 0) {
            $results = $("<div id='autocomplete-results'></div>").css("display", "none");
            $results.appendTo("body");
        }

       
        
        function selectItem($item, $input) {
            var item = $item.data("autocomplete.item");
            
            $item.addClass(selectedClass);
            $input.val(settings.itemValue(item));
            
            $input.trigger("autocompete.item-selected");
        }
        
        function selectPreviousItem($input) {
            
            var $items = $results.find("li");
            
            if ($items.first().hasClass(selectedClass)) { return false; }
            
            var $currentSelectedItem = $results.find("li." + selectedClass);
            var $selectedItem;
            
            if ($currentSelectedItem.size() > 0) {
                $selectedItem = $currentSelectedItem.prev("li");
                $currentSelectedItem.removeClass(selectedClass);
            } else {
                $selectedItem = $items.first();
            }
            
            selectItem($selectedItem, $input);
            
            return true;
        }
           
        function selectNextItem($input) {
            
            var $items = $results.find("li");
            
            if ($items.last().hasClass(selectedClass)) { return false; }
            
            var $currentSelectedItem = $results.find("li." + selectedClass);
            var $selectedItem;
            
            if ($currentSelectedItem.size() > 0) {
                $selectedItem = $currentSelectedItem.next("li");
                $currentSelectedItem.removeClass(selectedClass);
            } else {
                $selectedItem = $items.first();
            }
            
            selectItem($selectedItem, $input);
            
            return true;
        }
        
        function updateFailureResults() {
            if (settings.showFailure) {
                $results[0].innerHTML = "<div class='failure'>" + settings + "</div>";
            } else {
                hideResults();
            }
        }    
        
        function updateResults(results) {
            
            var howmany = Math.min(settings.limit, results.length);
            
            $results.empty();
            
            var $ul = $("<ul/>");
            
            for (var i = 0; i < howmany; i++) {
                var item = results[i];
                
                var $listItem = $("<li/>");
                $listItem.data("autocomplete.item", item);
                $listItem[0].innerHTML = settings.itemDisplay(item);
                
                $listItem.appendTo($ul);
            }
            
            $ul.appendTo($results);
        }
        
        function hideResults() {
            if ($results.is(":visible")) {
                $results.hide();
            }
        }   
        
        function showResults($input) {
            if (!$results.is(":visible")) {
                var offset = $input.offset();
                
                $results.css({
                    top: offset.top + $input.prop("offsetHeight"),
                    left: offset.left,
                    width: $input.prop("offsetWidth")
                })
                .show();
                
                $input.trigger("autocompete.show-results");
            }
        }

        function search(query) {
            
            var deferred = $.Deferred();
            
            if (isDataSourceUrl) {
                
                var urlDataSourceParams = {};
                $.extend(urlDataSourceParams, settings.extraParams);
                
                // put this after extend to make sure this isnt overwritten
                urlDataSourceParams[settings.queryParam] = query;
                
                $.ajax({
                    url: settings.dataSource,
                    type: "GET",
                    data: urlDataSourceParams,
                    dataType: "json",
                    success: function(data) {
                        deferred.resolve(settings.parse(data));
                    },
                    error: function() {
                        deferred.resolve([]);
                    }
                });
            } else {
                var results = [];
                
                var data = settings.dataSource;
                
                for (var i = 0; i < settings.dataSource.length; i++) {
                    var item = data[i];
                    
                    if (settings.filter(item, query)) {
                        results.push(item);
                    }
                }
                
                deferred.resolve(results);
            }
            
            return deferred;
        }
        
        function retrieveData($input, query) {
            
            $results.data("hasData", false);
            
            var onDataSuccess = function(results) {
                $results.data("hasData", true);
                updateResults(results);
            };
            
            var onDataFailure = function() {
                $results.data("hasData", false);
                updateFailureResults();
            }
            
            $.when(search(query)).then(function(results) {
            	
            	$input.trigger("autocomplete.data-retrieved");
            	
                results.sort(settings.sort);
            	
                if (results && results.length) {
                    onDataSuccess(results);
                } else {
                    onDataFailure();
                }
                showResults($input); 
            });
        }
        
        function shouldIgnoreKeyup(keyCode) {
            return keyCode == KEYLEFT
                    || keyCode == KEYUP
                    || keyCode == KEYRIGHT
                    || keyCode == KEYDOWN
                    || keyCode == ENTER_KEY
        }
        
        function shouldIgnoreKeydown(keycode) {
            return !shouldIgnoreKeyup(keycode);
        }
        
        
        return this.each(function() {
            
            var $input = $(this);
            
            if ($input.data("autocomplete") == true) { return; }
            
            if (typeof settings.dataSource == "undefined" || !settings.dataSource) {
                throw new Error("a dataSource is required");
            }
            
            if (this.tagName != "INPUT" || $input.prop("type") != "text") {
                throw new Error("can only turn inputs into autocompletes");
            }

            var lastQuery = this.value;
            var showResultsTimeout = null;

            $results.delegate("li", "click", function(e) {
                selectItem($(this), $input);
                hideResults();
            });
            
            var resetAutocomplete = function() {
                clearTimeout(showResultsTimeout);
                showResultsTimeout = null;
                hideResults(); 
                lastQuery = "";
            }
            
            $input
            	.data("autocomplete", true)
                .addClass("autocomplete")
                .attr("autocomplete", "off")
                .bind("keyup", function(e) {
                    if (shouldIgnoreKeyup(e.keyCode)) { return; }
                    
                    if (this.value.length >= settings.minimumCharacters) {
                        if (this.value != lastQuery) {
                            clearTimeout(showResultsTimeout);
                            showResultsTimeout = null;
                            
                            showResultsTimeout = setTimeout((function(input) {
                                return function() {
                                    
                                    retrieveData($(input), input.value);
                                    lastQuery = input.value;
                
                                };
                            })(this), settings.delay);
                        }
                    } else {
                    	resetAutocomplete();
                    }
                })
                .keydown(function(e) {
                    if (shouldIgnoreKeydown(e.keyCode)) { return; }
                    
                    if (e.keyCode == ENTER_KEY) {
                        if ($results.is(":visible")) {
                            hideResults();
                            e.preventDefault();
                        }
                        
                        return;
                    }
                    
                    var $input = $(this);
                    
                    if ($results.is(":visible") && $results.data("hasData")) {
                        switch (e.keyCode) {
                            case KEYUP:
                                if ($input.val() == lastQuery) {
                                    hideResults();
                                }
                                
                                if (!selectPreviousItem($input)) {
                                    $input.val(lastQuery);
                                };
                                
                                break;
                            case KEYDOWN:
                                selectNextItem($input);
                                break;
                        }
                    }
                })
                .blur(function(e) {
                    
                    // little delay to allow click event on selected item to happen
                    setTimeout(function() {
                    	resetAutocomplete();
                    }, 200);
                });
        });
    };
    
})(jQuery);