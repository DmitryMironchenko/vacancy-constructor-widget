var hhApi = angular.module('hhApi', []);

hhApi.factory('HHApi', function($http, $q, urlUtils){
    var regionsList,
        plainRegionsList;

    return{
        getRegions: function(){
            console.log('HHApi.getRegions');
            var d = $q.defer();

            $http.get(urlUtils.getHHApiUrl('/areas'))
                .then(function(data, status, headers, config){
                    regionsList = data.data;

                    // Convert areas tree to flat list
                    var plainList = [];
                    _(regionsList).each(function(item){
                        plainList.push(item.name);
                        _(item.areas).each(arguments.callee, item);
                    });
                    plainRegionsList = plainList;

                    d.resolve(regionsList);
                });

            return d.promise;
        },


        /**
         * Retrieves list of Regions from HH API converted in plain list
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
                d.resolve(_.chain(plainRegionsList)
                    .filter(function(item){return item.toLowerCase().indexOf(searchString.toLowerCase()) != -1})
                    .take(10)
                    .value()
                );
            }

            return d.promise;
        },

        /**
         * Retrieves specializations from HH API
         * @returns {Function|promise|Function}
         */
        getSpecializations: function(){
            var d = $q.defer();
            $http.get(urlUtils.getHHApiUrl('/specializations'))
                .then(function(data, status, headers, config){
                    d.resolve(data.data);
                });

            return d.promise;
        },

        /**
         * Searches for vacancies
         * @param criteria
         */
        searchVacancies: function(criteria){
            var d = $q.defer();

            setTimeout(function(){
                d.resolve({data:{
                    regions: ['Moscow', 'S-Petersburg'],
                    vacancies: [{
                        name: 'Bydlocoder',
                        company: 'India Co.',
                        salary: '3 BYR'
                    },{
                        name: 'Bydlocoder',
                        company: 'India Co.',
                        salary: '100500 BYR'
                    },{
                        name: 'Lead QA Engineer',
                        company: 'India Co.',
                        salary: 'from 100500 BYR'
                    },{
                        name: 'CEO',
                        company: 'India Co.',
                        salary: 'over 9000 BYR'
                    }],

                    allVacanciesLink: {
                        url: 'http://google.com',
                        description: 'Look all 100500 vacancies'
                    }
                }});
            }, 500);

            return d.promise;
        }
    }
});