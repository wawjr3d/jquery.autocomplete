/*
 * TODO: keep refactoring...not as heavily as before!
 */
(function($, undefined) {
	
	var global = this;
	var console = typeof global.console != "undefined" ? global.console : {
		log: $.noop,
		error: $.noop
	}

    $.fn.autocomplete = function(options) {
    	
    	if (this.length == 0) { return this; }

    	var AUTOCOMPLETE = "autocomplete",
		
    		EVENTS = (function() {
    			var events = {
	    			OPEN: "open",
	    			CLOSE: "close",
	    			SEARCH: "search",
	    			SEARCH_COMPLETE: "search:complete",
	    			ITEM_HIGHLIGHTED: "item:highlighted",
	    			ITEM_SELECTED: "item:selected"
	    		}
    			
    			for(eventId in events) {
    				events[eventId] = AUTOCOMPLETE + ":" + events[eventId];
    			}
    			
    			return events; 
    		})(),
    		
    		HIGHLIGHTED_CLASS = "highlighted",
    		LOADING_CLASS = "loading",
    	
    		TEXT_BASED_INPUT_TYPES = ["text", "email", "search", "url"],

    		
    		// keys
    		KEYLEFT = 37,
    		KEYUP = 38,
    		KEYRIGHT = 39,
    		KEYDOWN = 40,
    		ENTER_KEY = 13,
    		
    		// stolen from jquery.ui, used to prevent race conditions
    		autocompleteCount = 0;
    	
        var defaultOptions = {
            
        	dataSource: "",

            queryParam: "q",

            extraParams: {},

            minimumCharacters: 3,

            delay: 400,

            limit: 10,
         
            showFailure: true,
            
            failureMessage: "No results found.",

            itemDisplay: function(item) {
                return item.value;
            },

            itemValue: function(item) {
                return item.value;
            },

            filter: function(value, query) {
                return value.toLowerCase().indexOf(query.toLowerCase()) > -1;
            },

            parse: function(data) {
                return data;
            },

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

 
        return this.first().each(function() {

            var $input = $(this);
            
            if ($input.data("autocomplete") == true) { return; }
            
            if (typeof settings.dataSource == "undefined" || !settings.dataSource) {
                console.error("a dataSource is required");
            	return;
            }
            
            if (this.tagName != "INPUT" || $.inArray($input.prop("type"), TEXT_BASED_INPUT_TYPES) < 0) {
            	console.error("can only turn text based inputs into autocompletes");
            	return;
            }

            var lastQuery = this.value;
            var showResultsTimeout = null;
            
            function resetAutocomplete() {
                clearTimeout(showResultsTimeout);
                showResultsTimeout = null;
                hideResults(); 
                lastQuery = "";
            }
            
	        function selectItem($item) {
	        	if (!$item) { $item = getHighlightedItem(); }
	        	if (!$item || !$item.length) { return; }
	        	
	            var item = $item.data("autocomplete.item");
	
	            $input.val(settings.itemValue(item)).trigger(EVENTS.ITEM_SELECTED, item);
	            
	            hideResults();
	        }
	        
	        function getHighlightedItem() {
	        	return $results.find("li." + HIGHLIGHTED_CLASS);
	        }
	        
	        function highlightPrevious() {
	            
	            var $items = $results.find("li");
	            if ($items.first().hasClass(HIGHLIGHTED_CLASS)) { return false; }
	            
	            var $currentHighlightedItem = getHighlightedItem();
	            if ($currentHighlightedItem.size() == 0) { return false; }
	
	            var $highlightedItem = $currentHighlightedItem.prev("li");
	            $currentHighlightedItem.removeClass(HIGHLIGHTED_CLASS);
	            
	            highlightItem($highlightedItem);
	            
	            return true;
	        }
	           
	        function highlightNext() {
	            
	            var $items = $results.find("li");
	            if ($items.last().hasClass(HIGHLIGHTED_CLASS)) { return false; }
	            
	            var $currentHighlightedItem = getHighlightedItem();
	            var $highlightedItem;
	            
	            if ($currentHighlightedItem.size() > 0) {
	                $highlightedItem = $currentHighlightedItem.next("li");
	                $currentHighlightedItem.removeClass(HIGHLIGHTED_CLASS);
	            } else {
	                $highlightedItem = $items.first();
	            }
	
	            highlightItem($highlightedItem);
	            
	            return true;
	        }
	        
	        function highlightItem($item) {
	        	$item.addClass(HIGHLIGHTED_CLASS);
	            var item = $item.data("autocomplete.item");
	        	
	            $input.val(settings.itemValue(item)).trigger(EVENTS.ITEM_HIGHLIGHTED, item);
	        }
	        
	        function loadResults(results) {
	            
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

	            $ul.delegate("li", "click", function(e) { selectItem($(this)); }).appendTo($results);
	        }
	        
	        function loadFailureMessage() {
	            $results[0].innerHTML = "<div class='failure'>" + settings.failureMessage + "</div>";
	        }
	        
	        function getPosition($element) {
	        	var position = $element.css("position");
	        	return position == "fixed" ? "fixed" : "absolute";
	        }
	        
	        function getZIndex($element) {
	        	var zIndex = $element.css("zIndex");
	        	return zIndex == "auto" ? 0 : zIndex;
	        }
	        
	        function showResults() {
	            if (!$results.is(":visible") && !$input.prop("disabled")) {
	                var offset = $input.offset();
	                
	                $results.css({
	                	position: getPosition($input),
	                    top: offset.top + $input.prop("offsetHeight"),
	                    left: offset.left,
	                    width: $input.prop("offsetWidth"),
	                    zIndex: getZIndex($input) + 1
	                })
	                .show();
	                
	                $input.trigger(EVENTS.OPEN);
	            }
	        }
	        
	        function hideResults() {
	            if ($results.is(":visible")) {
	                $results.hide();
	                
	                $input.trigger(EVENTS.CLOSE);
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
	                    context: {
	                    	currentAutocomplete: ++autocompleteCount
	                    },
	                    success: function(data) {
	                    	if (autocompleteCount == this.currentAutocomplete) {
	                            deferred.resolve(settings.parse(data));                    		
	                    	}
	                    },
	                    error: function() {
	                    	if (autocompleteCount == this.currentAutocomplete) {
	                    		deferred.resolve([]);
	                    	}
	                    },
	                    
	                    /*
	                     * im not sure if you MUST resolve or reject a deferred to make sure its
	                     * garbage collected but didnt want to take a chance, if it gets rejected
	                     * at this point it wasnt supposed to run because another query has
	                     * happened 
	                     */
	                    complete: function() {
	                    	deferred.reject();
	                    }
	                });
	            } else {
	                var results = [];
	                
	                var data = settings.parse(settings.dataSource);
	                
	                for (var i = 0; i < data.length; i++) {
	                    var item = data[i];
	                    
	                    if (settings.filter(settings.itemValue(item), query)) {
	                        results.push(item);
	                    }
	                }
	                
	                deferred.resolve(results);
	            }
	            
	            return deferred;
	        }
	        
	        function retrieveData(query) {
	            
	            $input.addClass(LOADING_CLASS);
	            $input.trigger(EVENTS.SEARCH, query);
	            
	            $.when(search(query)).then(function(results) {
	            	
	            	$input.removeClass(LOADING_CLASS);
	            	$input.trigger(EVENTS.SEARCH_COMPLETE, {"results": results});
	
	                if (results.length) {
	                    results.sort(settings.sort);
	                	loadResults(results);
	                } else {
	                	loadFailureMessage();
	                }
	            
	                if (settings.showFailure) {
	                	showResults();
	                } else {
	                	hideResults();
	                }
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

            $input
            	.data("autocomplete", true)
                .addClass("autocomplete")
                .attr("autocomplete", "off")
                .keyup(function(e) {
                    if (shouldIgnoreKeyup(e.keyCode)) { return; }
                    
                    if (this.value.length >= settings.minimumCharacters) {
                        if (this.value != lastQuery) {
                            clearTimeout(showResultsTimeout);
                            showResultsTimeout = null;
                            
                            showResultsTimeout = setTimeout((function(input) {
                                return function() {
                                    
                                    retrieveData(input.value);
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
                    
                    var $input = $(this);
                    
                    if (e.keyCode == ENTER_KEY) {
                        if ($results.is(":visible")) {
                        	selectItem()
                            e.preventDefault();
                        }
                        
                        return;
                    }
                    
                    if ($results.is(":visible")) {
                        switch (e.keyCode) {
                            case KEYUP:
                                if ($input.val() == lastQuery) {
                                    hideResults();
                                }
                                
                                if (!highlightPrevious()) {
                                    $input.val(lastQuery);
                                };
                                
                                break;
                            case KEYDOWN:
                                highlightNext();
                                break;
                        }
                    }
                })
                .focus(function(e) {
                	lastQuery = this.value;
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