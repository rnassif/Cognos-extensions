
define([], function() {
	'use strict';
	class VizStats {

		/**
		 * 
		 * @param {*} options.params map that contains the list of features defined 
		 * in both the dependencies and runtimeDependencies lists
		 *
		 */
		constructor(options) {
            // This map contains the list of features listed as dependencies.
            this.features =  options.features;
		}
	

		/**
		 * Return the feature API interface
		 * 
		 */
		getAPI() {
			return {
				getStats: () => this.getStats()
			}
		}
	
        /**
         * 
         * Calculate some basic data statistics, like minimum, maximum and average.
         * 
         */
        getStats() {
           const queryResult = this.features['DataQueryExecution'].getCurrentQueryResults().getResult();            
            // Find the column index for the facts in the result
           const indexMap = this.getFactAndAttributeIndexMap(queryResult.getResultItemList())
     
           // get the fact data
           const factsDataMap = this.getFactDataMap (queryResult, indexMap.factsIndexMap);

           const stats = {};
           for (let label in factsDataMap) {
               const dataArray = factsDataMap[label];

               const minValue = Math.min.apply(null, dataArray);
               const attributesWithMinValue = this.getAttributeLabelForRowIndex(indexMap.attributesIndexMap, queryResult, dataArray.indexOf(minValue));

               const maxValue = Math.max.apply(null, dataArray) 
               const attributesWithMaxValue = this.getAttributeLabelForRowIndex(indexMap.attributesIndexMap, queryResult, dataArray.indexOf(maxValue));

               stats[label] = {
                   min: { value: minValue, attributesLabel: attributesWithMinValue},
                   max: { value: maxValue, attributesLabel: attributesWithMaxValue} ,
                   avg: { value: dataArray.reduce((a,b)=> a+b, 0) / dataArray.length}
               };
            }
            return stats;
        }

        /**
         * 
         * Create a label that contains all the attributes at given row index.
         * 
         */
        getAttributeLabelForRowIndex(attributesIndexMap, queryResult, rowIndex){
            const values = [];
            for(let label in attributesIndexMap) {
                // remember, an attribute might contain multiple tuples, so the value is an array;
                const valueTuple = queryResult.getValue(rowIndex, attributesIndexMap[label]);
                if (valueTuple) {
                    values.push(valueTuple.map(value => value.label).join() );
                }
                
            }
           return values.join();
        }

        /**
         * Create 2 maps for the facts and attributes. 
         * The key is the label of the fact/attribute and the value is the column index in the result
         * 
         */
        getFactAndAttributeIndexMap(queryItemList) {
            // Build a fact index map. The key is the fact label and the value is the index of the column that is equivalent to this fact.
            const factsIndexMap = {};
            const attributesIndexMap = {};
            queryItemList.forEach((queryItem, index) => {
                const dataItemList = queryItem.getDataItemList();
                // A query item is a tuple that might contain multiple dataitem. Depending on the visualization, but in most case, it is only one data item
                const isTheQueryItemAnAttribute = !!dataItemList.find((dataItem) => dataItem.getType() === 'attribute');
                const label = dataItemList.map(dataItem => dataItem.getLabel()).join();
                if (isTheQueryItemAnAttribute){
                    attributesIndexMap[label]  = index;  
                } else {
                    // If the query item is a fact, it is safe to say that it contains one dataItem.
                    factsIndexMap[label]  = index;
                }

            });

            return  { 
                factsIndexMap: factsIndexMap,
                attributesIndexMap: attributesIndexMap
            }
        }

        /**
         * Create a data map for the facts. The key is the fact label and the value is the data array.
         * 
         */
        getFactDataMap(queryResult, factsIndexMap) {
            const factDataMap = {};
            const rowCount = queryResult.getRowCount();
            for (let label in factsIndexMap) {
                factDataMap[label] = [];
                const columnIndex = factsIndexMap[label];
                for (let i = 0 ; i < rowCount; i++){
                    const value = queryResult.getValue(i, columnIndex ).value;
                    if (value != null) {
                        factDataMap[label].push(value);
                    }
                    
                }
            }

            return factDataMap;
        }

		/**
		 * Called when the dashboard is closed
		 */
		destroy() {
		}   
	}
	return 	VizStats;
});
