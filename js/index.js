			function StB_lin(progfaktor, steuersatz, grenze) {
				return function(zvE) {
					var y = (zvE - grenze) / 10000.0;
					return (progfaktor * y + steuersatz) * y;
				}
			}
		    	
			function StB_konst(steuersatz, grenze) {
				return function(zvE) {
					return steuersatz * (zvE - grenze);
				}
			}
    	
			/**
			 * computes the current taxes for an amount of brutto income 
			 * the parameters of the StB_* functions are fetched from https://www.bmf-steuerrechner.de/ekst/?
			 * @param {Number} x Brutto Income
			 * @return {Array} containing
			 */
			function computeTaxesCurrent(x) {   	
				if (x<8130) {
					return [0, 0];
				} else if (x<13470) {
					return [StB_lin(933.7, 1400, 8130)(x), 0];
				} else if (x<52882) {
					return [1014 + StB_lin(228.74, 2397, 13469)(x), 0];
				} else if (x<250731) {
					return [1014 + 13000, StB_konst(0.42, 52881)(x)];
				} else {
					return [1014 + 13000, 83096 + StB_konst(0.45, 250730)(x)];
				}	    	
			}

			/**
			 * computes the taxes according to plans of die Gruenen for an amount of brutto income 
			 * the parameters of the StB_* functions are computed to an accuracy of 0.01€
			 * @param {Number} x Brutto Income
			 * @return {Array} containing
			 */
			function computeTaxesGruene(x) {    	
				if (x<8712) {
					return [0, 0];
				} else if (x<13470) {
					return [StB_lin(1047.71, 1400, 8712)(x), 0];
				} else if (x<52882) {
					return [903 + StB_lin(228.74, 2397, 13469)(x), 0];
				} else if (x<60000) {
					return [903 + 13000, StB_lin(210.70, 4200, 52881)(x)];
				} else if (x<80000) {
					return [903 + 13000, 3096 + StB_lin(100.00, 4500, 59999)(x)];
				} else {
					return [903 + 13000, 12496 + StB_konst(0.49, 79999)(x)];
				}	    	  	
			}
			
			/**
			 * computes the tax Rate (Grenzsteuersatz) for an amount of brutto income
			 * @param {Number} x brutto income
			 * @return {Array} containing the tax rate according to plans of Gruene and current state
			 * and the index where the row will be inserted in the dataTable afterwards
			 */
			function computeTaxRates(x) {
			
				if (x<8130) {
					yGruene = 0;
					yAktuell = 0;
					index = 1;
				}
				else if (x<8712) {
					yGruene = 0;
					yAktuell =18.67 * Math.pow(10, -4) * x - 1.179;
					index = 3;
				}
				else if (x<13470) {
					yGruene = 20.95 * Math.pow(10, -4) * x - 4.255;
					yAktuell =18.67 * Math.pow(10, -4) * x - 1.179;
					index = 5;
				}
				else if (x<52882) {
					yGruene = 4.575 * Math.pow(10, -4) * x + 17.81;
					yAktuell = 4.575 * Math.pow(10, -4) * x + 17.81;
					index = 6;
				}
				else if (x<60000) {
					yGruene = 4.215 * Math.pow(10, -4) * x + 19.71;
					yAktuell = 42;
					index = 7;
				}
				else if (x<80000) {
					yGruene = 2 * Math.pow(10, -4) * x + 33;
					yAktuell = 42;
					index = 8;
				}
				else if (x<250731) {
					yGruene = 49;
					yAktuell = 42;
					index = 9;
				}
				else {
					yGruene = 49;
					yAktuell = 45;
					index = 11;
				}
				
				return [yGruene, yAktuell, index];
				
			}
			
			/**
			 * updates a DataTable, so the tax rates for all rows up to a certain value are added in column 4 (Gruene) and 5 (current)
			 * @param {DataTable} table which is updated
			 * @param {Number} x value up to which the tax rates are computed
			 */
			function updateDataTable(table, x) {
			
				for (var i=0; i<table.getNumberOfRows(); i++) {
				
					var step = table.getValue(i, 0);		
						
					if (step<=x) {			
					
						taxRates = computeTaxRates(step);
												
						table.setValue(i, 4, Math.round(taxRates[0]*100) / 100);
						table.setValue(i, 5, Math.round(taxRates[1]*100) / 100);
						
					} else {
					
						table.setValue(i, 4, null);
						table.setValue(i, 5, null);
						
					}				
					
				}
			
			}
			
			google.load("visualization", "1", {packages:["corechart"]});
			google.setOnLoadCallback(drawChart);

			function drawChart() {

				var data = new google.visualization.DataTable();
				var data2 = new google.visualization.DataTable();
				var dataUser = new google.visualization.DataTable();
	
				data.addColumn('number', 'Bruttoeinkommen');
				data.addColumn({type: 'string', role: 'annotation'});
				data.addColumn('number', 'Gr\u00FCnen');
				data.addColumn('number', 'Aktuell');	
				data.addColumn('number', 'Gr\u00FCnen');
				data.addColumn('number', 'Aktuell');

				data2.addColumn('number', 'Bruttoeinkommen');
				data2.addColumn({type: 'string', role: 'annotation'});
				data2.addColumn('number', 'Gr\u00FCnen');
				data2.addColumn('number', 'Aktuell');	
				data2.addColumn('number', 'Gr\u00FCnen');
				data2.addColumn('number', 'Aktuell');
				
				dataUser.addColumn('string', 'Vorschlag');
				dataUser.addColumn('number', 'Gr\u00FCnen');
				dataUser.addColumn({type:'string', role: 'tooltip', 'p': {'html': true}});
				dataUser.addColumn('number', 'Aktuell');
				dataUser.addColumn({type:'string', role: 'tooltip', 'p': {'html': true}});
				
				data.addRows([
					[0, null, 0, 0, null, null],
					[8129, null, 0, 0, null, null],
					[8130, null, 0, 14, null, null],
					[8711, null, 0, null, null, null],
					[8712, null, 14, null, null, null],
					[13470, null, 23.97, 23.97, null, null],
					[52882, null, 42, 42, null, null],
					[60000, null, 45, null, null, null],  
					[80000, null, 49, null, null, null],
					[89999, null, 49, 42, null, null]
				]);

				data2.addRows([
					[90000, null, 49, 42, null, null],
					[250730, null, null, 42, null, null],
					[250731, null, null, 45, null, null],
					[300000, null, 49, 45, null, null]  
				]);

				var options = {
					vAxis: {title: 'Grenzsteuersatz in %', minValue: 0}, 
					hAxis: {title: 'zu versteuerndes, j\u00E4hrliches Bruttoeinkommen in \u20AC', textStyle: {fontSize: 12}},
					annotations: {style: 'line'},
					interpolateNulls: true,
					legend: {position:'none'},
					chartArea: {left:'15%', width:'100%', top:'5%'},
					animation: {duration: 000, easing: 'in'},
					colors: ['green', 'blue'],
					seriesType: "line",
					series: {2: {type: "area"}, 3: {type: "area", areaOpacity:0.2}},
					fontSize: 14
				};

				var options2 = { 
					vAxis: {minValue: 0}, 
					hAxis: {gridlines: {count: 3}, textStyle: {fontSize: 12}, allowContainerBoundaryTextCufoff: true},
					annotations: {style: 'line'},
					interpolateNulls: true,
					chartArea: {left:11, top:'5%'},
					animation: {duration: 000, easing: 'in'},
					colors: ['green', 'blue'],
					seriesType: "line",
					series: {2: {type: "area", visibleInLegend: false}, 3: {type: "area", visibleInLegend: false, areaOpacity: 0.2}},
					fontSize:14
				};

				var chart = new google.visualization.ComboChart(document.getElementById('chartDiv'));
				chart.draw(data, options);

				var chart2 = new google.visualization.ComboChart(document.getElementById('chart2Div'));
				chart2.draw(data2, options2);

				var chartUser = new google.visualization.ColumnChart(document.getElementById('chartUserDiv'));
				// no visualisation at this point

				var button = document.getElementById('button');
				var checkboxLabel = document.getElementById('checkboxLabel');
				var checkbox = document.getElementById('checkbox');
				var txt = document.getElementById('txt');		
				
				var indexInsertedRow = -1;
				
				button.onclick = function() {
				
					var x = parseInt(txt.value);
					
					if (data.getNumberOfRows() > 10) {
						data.removeRow(indexInsertedRow);
					} 
					
					if (data2.getNumberOfRows() > 4) {
						data2.removeRow(indexInsertedRow % 8);
					} 
					
					if (dataUser.getNumberOfRows() > 0) {
						dataUser.removeRows(0, 4);
					}
					
					var taxRates = computeTaxRates(x);
					indexInsertedRow = taxRates[2];
					
					if (x<90000) {
						data.insertRows(indexInsertedRow, [[x, 'Ich', Math.round(taxRates[0]*100)/100, Math.round(taxRates[1]*100)/100, null, null]]);
					} else if (x<300000) {
						data2.insertRows(indexInsertedRow % 8, [[x, 'Ich', Math.round(taxRates[0]*100)/100, Math.round(taxRates[1]*100)/100, null, null]]);
					}
					
					if (x<53500) {
						checkboxLabel.style.visibility="hidden";
					} else {
						checkboxLabel.style.visibility="visible";
					}
					
					updateDataTable(data, x);
					updateDataTable(data2, x);
					
					chart.draw(data, options);
					chart2.draw(data2, options2);
					
					if (!checkbox.checked) {
						drawChartUser(x, 700);
					}
					else {
						detailChartUser(x, 700);
					}
					
				}
				
				checkboxLabel.onclick = function() {
				
					var x = parseInt(txt.value);
				
					if (dataUser.getNumberOfRows() > 0) {
						dataUser.removeRows(0, 4);
					}				
				
					if (checkbox.checked) {
						detailChartUser(x, 0);
					} 
					else {
						drawChartUser(x, 0);
					}
					
				}
				
				function drawChartUser(x, animationDur) {
				
					if (dataUser.getNumberOfColumns() > 5) {
						dataUser.removeColumns(5, 4);						
					} 
										
					var taxesCurrent = computeTaxesCurrent(x);
					var taxesCurrentSummed = Math.round(taxesCurrent[0] + taxesCurrent[1]);
					var taxesCurrentAv = Math.round(taxesCurrentSummed*1000/x)/10;
					var taxesGruene = computeTaxesGruene(x);
					var taxesGrueneSummed = Math.round(taxesGruene[0] + taxesGruene[1]);
					var taxesGrueneAv = Math.round(taxesGrueneSummed*1000/x)/10;
					
					var optionsUser = {
						isStacked: true,
						tooltip: {isHtml: true},
						chartArea: {left:'18%', top:'10%', width:'68%'},
						vAxis: {title: 'Steuerbelastung in \u20AC', minValue: 0/*0.8 * Math.min(taxesCurrentSummed, taxesGrueneSummed)*/},
						animation: {duration: animationDur, easing: 'in'},
						colors: ['green', 'blue'],
						legend: {position: 'none'},
						bar: {groupWidth: '98.5%'},
						fontSize: 14
					};
				
					dataUser.addRows([
						['', 0, '', 0, ''],
						[
							'Gr\u00FCnen', 
							taxesGrueneSummed, 
							'<div class="tooltip">' + taxesGrueneSummed.toString() + 
								'\u20AC <span> j&auml;hrlich entspricht einem <br>Durchschnittssteuersatz von </span>' + taxesGrueneAv.toString() + '% </div>',
							0, 
							''
						],
						[
							'Aktuell', 
							0, 
							'',
							taxesCurrentSummed, 
							'<div class="tooltip">' + taxesCurrentSummed.toString() + 
								'\u20AC <span> j&auml;hrlich entspricht einem <br>Durchschnittssteuersatz von </span>' + taxesCurrentAv.toString() + '% </div>'
						],
						['', 0, '', 0, '']
					]);
					
					chartUser.draw(dataUser, optionsUser);
		    	
				}
				
				function detailChartUser(x, animationDur) {
			
					if (dataUser.getNumberOfColumns() < 6) {

						dataUser.addColumn('number', 'Gr\u00FCne2');	
						dataUser.addColumn({type:'string', role: 'tooltip', 'p': {'html': true}});
						dataUser.addColumn('number', 'Aktuell2');
						dataUser.addColumn({type:'string', role: 'tooltip', 'p': {'html': true}});
					}
					
					var taxesCurrent = computeTaxesCurrent(x);
					var taxesGruene = computeTaxesGruene(x);
					
					var optionsUser = {
						isStacked: true,
						tooltip: {isHtml: true},
						chartArea: {left:'18%', top:'10%', width:'68%'},
						vAxis: {title: 'Steuerbelastung in \u20AC', minValue: 0},
						animation: {duration: animationDur, easing: 'in'},
						colors: ['green', 'green', 'blue', 'blue'],
						legend: {position: 'none'},
						bar: {groupWidth: '98.5%'},
						fontSize:14
					};
					
					dataUser.addRows([
						['', 0, '', 0, '', 0, '', 0, ''],
						[
							'Gr\u00FCnen', 
							taxesGruene[0], 
							'<div class="tooltip">' + Math.round(taxesGruene[0]).toString() + 
								'\u20AC <span> j&auml;hrliche Steuerbelastung f&uuml;r mein Einkommen bis 52882&euro; </span> </div>',
							taxesGruene[1], 
							'<div class="tooltip">' + Math.round(taxesGruene[1]).toString() + 
								'\u20AC <span> j&auml;hrliche Steuerbelastung f&uuml;r mein Einkommen ab 52882&euro; </span> </div>',
							0, 
							'', 
							0, 
							''
						],
						[
							'Aktuell', 
							0, 
							'', 
							0, 
							'', 
							taxesCurrent[0], 
							'<div class="tooltip">' + Math.round(taxesCurrent[0]).toString() + 
								'\u20AC <span> j&auml;hrliche Steuerbelastung f&uuml;r mein Einkommen bis 52882&euro; </span> </div>',
							taxesCurrent[1], 
							'<div class="tooltip">' + Math.round(taxesCurrent[1]).toString() + 
								'\u20AC <span> j&auml;hrliche Steuerbelastung f&uuml;r mein Einkommen ab 52882&euro; </span> </div>'
						],
						['', 0, '', 0, '', 0, '', 0, '']
					]);
					
					chartUser.draw(dataUser, optionsUser);			
					
				}
				
			}
