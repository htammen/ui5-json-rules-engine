sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend(
		"de.tammenit.sap.ui5.rulesenginesimplified.json-rules-engine-simplified.controller.Main", {

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Main").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new JSONModel({
				"ruleEditMode": false,
				"currentAge": 17,
				"beerAllowed": false,
				"beerForbiddenMessage": "",
				"countries": [
					{
						"name": "US",
						"ruleProhibited": '{"conditions":{"age":{"less":21}},"event":{"type":"prohibited","params":{"value":"Hey, are you insane? You have to be at least 21 years old."}}}',
						"ruleAllowed": '{"conditions":{"age":{"greaterEq":21}},"event":{"type":"allowed"}}'
					},
					{
						"name": "GER",
						"ruleProhibited": '{"conditions":{"age":{"less":16}},"event":{"type":"prohibited","params":{"value":"Wait a litte while. Soon you will be 16 years old and then you are allowed to drink beer."}}}',
						"ruleAllowed": '{"conditions":{"age":{"greaterEq":16}},"event":{"type":"allowed"}}'
					},
					{
						"name": "SWE",
						"ruleProhibited": '{"conditions":{"age":{"less":18}},"event":{"type":"prohibited","params":{"value":"Unfortunately our government has to decide to allow you to drink beer from 18 years on."}}}',
						"ruleAllowed": '{"conditions":{"age":{"greaterEq":18}},"event":{"type":"allowed"}}'
					}
				],
				"currentCountry": "US",
				"newCountry": ""
			}), "dataModel");
			this._formatRulesInModel(); // just format the rule strings
			
			// Model used for Rule Popup
			this.getView().setModel(new JSONModel({
				"title": "",
				"rule": ""
			}), "ruleModel");
		},
		
		onExit : function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
			if( this._oNewCountryPopover ) {
				this._oNewCountryPopover.destroy();
			}
		},
		
		handleRouteMatched: function(oEvent) {
		},
		
		onChangeAge: function(oEvent) {
			var value = Number.parseInt(oEvent.getParameter("value"));
			this.onCheckRule(value);	
		},
		
		onSelectCountry: function(oEvent) {
			var item = oEvent.getParameter("item");
			var country = item.getProperty("name");
			this.getView().getModel("dataModel").setProperty("/currentCountry", country);
			this.onCheckRule();	
		},
		
		/**
		 * Runs the rules engine.
		 * This function retrieves the age from the dataModel, creates the facts object and runs the 
		 * rules engine against it.
		 */
		onCheckRule: function(oEvent) {

			var value = this.getView().getModel("dataModel").getProperty("/currentAge");
			if(typeof oEvent === "number") {
				value = oEvent;	
			}
			
			// create the facts to which the rules are applied 
			var facts = {
				age: value
			};
			// run the rules engine and react to the fired events
			this._generateRuleEngine().run(facts).then(function(events) { // run() returns remove event
				var data = this.getView().getModel("dataModel").getData();
				events.map(function(event) {
					switch(event.type) {
						case "prohibited":
							data.beerAllowed = false;
							data.beerForbiddenMessage = event.params.value;
							break;
						case "allowed":
							data.beerAllowed = true;
							break;
					}
				} );
				this.getView().getModel("dataModel").setData(data);
			}.bind(this));
			
		},
		
		onEditRules: function() {
			var model = this.getView().getModel("dataModel");
			
			model.setProperty("/ruleEditMode", !model.getProperty("/ruleEditMode"));
		},
		
		/**
		 * Save current rules in JSONModel
		 */
		onSaveRules: function(oEvent) {
			var model = this.getView().getModel("dataModel");
			model.setProperty("/ruleEditMode", !model.getProperty("/ruleEditMode"));
			this.onCheckRule();
		},
		
		onRuleLinkPressed: function(oEvent) {
			
			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("de.tammenit.sap.ui5.rulesenginesimplified.json-rules-engine-simplified.view.Rule", this);
				this.getView().addDependent(this._oPopover);
				this._oPopover.bindElement("ruleModel>/");
			}

			var ruleModel = this.getView().getModel("ruleModel");
			var currentRules = this._getCurrentRules(1);			
			if(oEvent.getSource().getId().indexOf("ruleProhibited") > -1) {
				ruleModel.setProperty("/title", "ruleProhibited");
				ruleModel.setProperty("/rule", currentRules.ruleProhibited);
			} else {
				ruleModel.setProperty("/title", "ruleAllowed");
				ruleModel.setProperty("/rule", currentRules.ruleAllowed);
			}

			this._oPopover.openBy(oEvent.getSource());
			
		},

		onAddNewCountry: function(oEvent) {
			// create popover
			if (!this._oNewCountryPopover) {
				this._oNewCountryPopover = sap.ui.xmlfragment("de.tammenit.sap.ui5.rulesenginesimplified.json-rules-engine-simplified.view.NewCountry", this);
				this.getView().addDependent(this._oNewCountryPopover);
				this._oNewCountryPopover.bindElement("dataModel>/");
			}
			this._oNewCountryPopover.openBy(oEvent.getSource());
		},

		onNewCountryOk: function(oEvent) {
			this._oNewCountryPopover.close();

			var model = this.getView().getModel("dataModel");
			var newCountry = model.getProperty("/newCountry");
			var countries = model.getProperty("/countries");
			
			var oRuleProhibited = JSON.parse('{"conditions":{"age":{"less":18}},"event":{"type":"prohibited","params":{"value":"You are too young."}}}');
			var oRuleAllowed = JSON.parse('{"conditions":{"age":{"greaterEq":18}},"event":{"type":"allowed"}}');
			countries.push(
				{
					"name": newCountry,
					"ruleProhibited": JSON.stringify(oRuleProhibited, null, '\t'),
					"ruleAllowed": JSON.stringify(oRuleAllowed, null, '\t')
				}
			)
		},

		onNewCountryCancel: function(oEvent) {
			this._oNewCountryPopover.close();
		},
		
		_getCurrentCountryItemIdx: function() {
			var currentIndex = -1;
			var model = this.getView().getModel("dataModel");
			var currentCountry = model.getProperty("/currentCountry");
			var countries = model.getProperty("/countries");
			countries.forEach(function(obj, idx) {
				if(obj.name === currentCountry) {
					currentIndex = idx;
				}				
			});
			return currentIndex;
		},
		
		/**
		 * Generates and returns the rule engine instance that can be used to run against a set of facts
		 * @returns {Object} the generated rules engine
		 */
		_generateRuleEngine: function() {
			// pull the Engine object from the glocal window object
			var Engine = window.getRulesEngine();
			// create a RulesEngine instance
			var ruleEngine = new Engine();

			// apply current rule to the engine instance
			var currentRules = this._getCurrentRules(0);			
			ruleEngine.addRule(currentRules.ruleProhibited);
			ruleEngine.addRule(currentRules.ruleAllowed);
			
			return ruleEngine;
		},
		
		/**
		 * Return the Rules for the currentCountry
		 * @params {int} type - 0 = get Rules as Object; 1 = get Rules as string
		 * @returns {Object} Object with properties 'ruleProhibited' and 'ruleAllowed'
		 */
		_getCurrentRules: function(type) {
			var model = this.getView().getModel("dataModel");
			var countries = model.getProperty("/countries");
			var currentCountry = model.getProperty("/currentCountry");
			var currentRules = countries.reduce(function(accumulator, obj) {
				if(obj.name === currentCountry) {
					if(type === 0 ) {
						accumulator.ruleProhibited = JSON.parse(obj.ruleProhibited);
						accumulator.ruleAllowed = JSON.parse(obj.ruleAllowed);
					} else {
						accumulator.ruleProhibited = obj.ruleProhibited;
						accumulator.ruleAllowed = obj.ruleAllowed;
					}
				}
				return accumulator;
			}, {});
			return currentRules;
		},
		
		_formatRule: function(strRule) {
			if(strRule !== "") {
				var oRule = JSON.parse(strRule);
				return JSON.stringify(oRule, null, '\t');
			} else {
				return "";
			}
		},
		
		_formatEditButton: function(bEditable) {
			return bEditable ? "View" : "Edit";
		},
		
		/**
		 * Formats the rules in the main model, so that they are displayed more readable.
		 */
		_formatRulesInModel: function() {
			var model = this.getView().getModel("dataModel");
			var countries = model.getProperty("/countries");
			countries.forEach(function(country) {
				var oRule = JSON.parse(country.ruleProhibited);					
				country.ruleProhibited = JSON.stringify(oRule, null, '\t');
				oRule = JSON.parse(country.ruleAllowed);					
				country.ruleAllowed = JSON.stringify(oRule, null, '\t');
			});
		}

	});
});