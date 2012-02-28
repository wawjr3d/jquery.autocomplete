describe("Autocomplete plugin", function() {
	
	var $input = $("<input>");
	
	function typicalBeforeEach() {
		$input.autocomplete("../demo/demo.json");
	}
	
	it("should require a dataSource", function() {

		expect(function() { $input.autocomplete(); }).toThrow(new Error("a dataSource is required"));
		
		expect(function() { $input.autocomplete(""); }).toThrow(new Error("a dataSource is required"));
		
		expect(function() { $input.autocomplete({ nodataSource: "what i passed" }); }).toThrow(new Error("a dataSource is required"));
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
});
