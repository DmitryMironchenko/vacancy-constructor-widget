var hhApi = angular.module('hhApi', []);

hhApi.factory('HHApi', function($http, $q, urlUtils){
    return{
        /**
         * Retrieves list of Regions from HH API
         * @param searchString
         * @returns {Function|promise|Function}
         */
        findRegions: function(searchString){
            var d = $q.defer();

            $http.get(urlUtils.getHHApiUrl('/areas'))
                .then(function(data, status, headers, config){
                    d.resolve(data.data);
                });

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