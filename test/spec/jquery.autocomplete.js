describe("Autocomplete plugin", function() {
	
	var $input = $("<input>");
	
	function typicalBeforeEach() {
		$input.autocomplete("../demo/demo.json");
	}
	
	it("should require a dataSource", function() {

		$input.autocomplete();
		expect($input.data("autocomplete")).toBeFalsy();
		
		$input.autocomplete("");
		expect($input.data("autocomplete")).toBeFalsy();
		
		$input.autocomplete({ nodataSource: "what i passed" });
		expect($input.data("autocomplete")).toBeFalsy();
	});

	it("should take one parameter as url", function() {

		typicalBeforeEach();
		
		expect($input.data("autocomplete")).toBeTruthy();
	});

	it("should take options with url as dataSource", function() {

		$input.autocomplete({
			dataSource: "../demo/demo.json"
		});
		
		expect($input.data("autocomplete")).toBeTruthy();
	});
	
	it("should turn off browsers native autocomplete", function() {
		typicalBeforeEach();
		
		expect($input.attr("autocomplete")).toEqual("off");
	});
	
	it("should create results div '#autocomplete-results'", function() {
		typicalBeforeEach();
		
		expect($("#autocomplete-results").size()).toBeGreaterThan(0);
	});
	
	it("should create autocomplete for any text based input", function() {
		
		var types = ["text", "email", "search", "url"];
		
		for(var i = 0, numberOfTypes = types.length; i < numberOfTypes; i++) {
			var type = types[i];
			
			var $typeInput = $("<input type='" + type + "'>");
			$typeInput.autocomplete("../demo/demo.json");
			
			expect($typeInput.data("autocomplete")).toBeTruthy();
		}

	});
});
