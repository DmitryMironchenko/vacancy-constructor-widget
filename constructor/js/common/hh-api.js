var hhApi = angular.module('hhApi', ['ngResource']);

hhApi.factory('HHApi', function($http, $q, urlUtils, $resource){
    var regionsList,
        plainRegionsList,
        plainRegionsNamesList,

        specializationsList,
        plainSpecializationsList,
        plainSpecializationsNamesList;

    function arrayToParam(arr, paramName){
        return paramName + '=' + arr.join('&' + paramName + '=');
    }

    return{
        getRegions: function(){
            //console.log('HHApi.getRegions');
            var d = $q.defer();

            $http.get(urlUtils.getHHApiUrl('/areas'))
                .then(function(data, status, headers, config){
                    regionsList = data.data;

                    // Convert areas tree to flat list
                    plainRegionsList = [];
                    _(regionsList).each(function(item){
                        plainRegionsList.push(item);
                        _(item.areas).each(arguments.callee, item);
                    });
                    plainRegionsNamesList = _.pluck(plainRegionsList, 'name');

                    d.resolve(regionsList);
                });

            return d.promise;
        },


        /**
         * Retrieves list of Regions from HH API converted in plain list. If no regions've been received
         * before - call for them first.
         * @param searchString
         * @returns {Function|promise|Function}
         */
        searchRegions: function(searchString){
            var d = $q.defer(),
                self = arguments.callee;

            if(!regionsList){
                return
                    this.getRegions()
                        .then(function(){return self(searchString);});
            }else{
                d.resolve(_.chain(plainRegionsNamesList)
                    .filter(function(item){return item.toLowerCase().indexOf(searchString.toLowerCase()) != -1})
                    .take(10)
                    .value()
                );
            }

            return d.promise;
        },

        /**
         * Returns list of regions objecsts by provided names
         * @param names
         * @returns {*}
         */
        getRegionsByNames: function(names){
            return _.filter(plainRegionsList, function(item){
                return _.contains(names, item.name);
            });
        },

        /**
         * Returns list of Specializations objecsts by provided names
         * @param names
         * @returns {*}
         */
        getSpecializationsByNames: function(names){
            return _.filter(plainSpecializationsList, function(item){
                return _.contains(names, item.name);
            });
        },

        /**
         * Retrieves specializations from HH API
         * @returns {Function|promise|Function}
         */
        getSpecializations: function(){
            var d = $q.defer();
            $http.get(urlUtils.getHHApiUrl('/specializations'))
                .then(function(data, status, headers, config){
                    specializationsList = data.data;

                    // Convert areas tree to flat list
                    plainSpecializationsList = [];
                    _(specializationsList).each(function(item){
                        plainSpecializationsList.push(item);
                        _(item.specializations).each(arguments.callee, item);
                    });
                    plainSpecializationsNamesList = _.pluck(plainSpecializationsList, 'name');

                    d.resolve(data.data);
                });

            return d.promise;
        },

        /**
         * Searches for vacancies
         * @param criteria
         */
        searchVacancies: function(criteria){
            /*
            return $resource(urlUtils.getHHApiUrl('/vacancies'), {callback: 'JSON_CALLBACK'}, {
                jsonp_query: {
                    method: 'JSONP',
                    params: {area : 1, area: 2}
                }
            }).jsonp_query();
            */

            var d = $q.defer(),
                urlParams = [];

            if(criteria.area instanceof Array && criteria.area.length > 0){
                urlParams.push(arrayToParam(criteria.area, 'area'));
            }
            if(criteria.specialization instanceof Array && criteria.specialization.length > 0){
                urlParams.push(arrayToParam(criteria.specialization, 'specialization'));
            }
            if(criteria.text){
                urlParams.push('text=' + criteria.text);
            }


            console.log('hhapi.searchVacancies urlParams:', urlParams, criteria);
            $http.get(urlUtils.getHHApiUrl('/vacancies?' + urlParams.join('&')))
                .then(function(data, status, headers, config){
                    d.resolve(data.data);
                });

            return d.promise;
        }
    }
});