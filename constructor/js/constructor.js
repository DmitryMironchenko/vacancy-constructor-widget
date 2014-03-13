var constructorApp = angular.module('VacancyWidgetConstructorApp', ['ngTagsInput', 'urlUtils', 'hhApi', 'commonControls', 'ngResource'])
    .config(function(tagsInputConfigProvider) {
        tagsInputConfigProvider
            .setDefaults('tagsInput', {
                placeholder: 'Добавить',
                addOnEnter: false,
                customClass: "bootstrap"
            })
        .setDefaults('autoComplete', {
            maxResultsToShow: 10,
            debounceDelay: 1000
        });
    });

function WidgetConstructorCtrl($scope, HHApi,$rootScope, VacancyCriteriaBuilder){
    $scope.version = '1.0.9';

    // Array of areas objects received from hh api endopint
    $scope.areas = [];
    // Array of areas that are selected currently. Is array of strings. Not a subarray of $scope.areas
    $scope.selectedAreas = [];

    // Array of entered keywords
    $scope.keyWords = '';

    // Specializations
    $scope.specializations = [];
    $scope.selectedSpecializations = [];

    $scope.vacanciesAmount = 6;

    HHApi.getRegions()
        .then(function(data){
            //console.log('Regions received', data);
            $scope.areas = angular.copy(data);

            $scope.loadRegionsSuggestion = function(query){
                return HHApi.searchRegions(query);
            }
        });
    HHApi.getSpecializations()
        .then(function(data){
            //console.log('Specializations received', data);
            $scope.specializations = data;
        });

    $scope.specializationsSelected = function(data){
        console.log('specializationsSelected', data);
        $scope.selectedSpecializations = angular.copy(_.union($scope.selectedSpecializations, data));

        // very bad approach
        $('.tag-input').focus().blur();
    }

    $scope.regionsSelected = function(data){
        console.log('regionsSelected', data);
        $scope.selectedAreas = angular.copy(_.union($scope.selectedAreas, data));

        // very bad approach
        $('.tag-input').focus().blur();
    }

    _(['selectedAreas', 'selectedSpecializations', 'keyWords', 'vacanciesAmount']).each(function(item){
            $scope.$watch(item, _.debounce(function(){
                console.log('$scope watch items...');
                var criteria = VacancyCriteriaBuilder.buildCriteria(
                    $scope.selectedAreas,
                    $scope.selectedSpecializations,
                    $scope.keyWords
                );

                console.log('...$scope.$watchCollection', criteria);
                HHApi.searchVacancies(criteria)
                    .then(function(resp){
                        $scope.vacancies = _(resp.items).take($scope.vacanciesAmount);
                    });
            }, 1000), true
            )});
}

constructorApp.factory('VacancyCriteriaBuilder', function(HHApi){
    return {
        buildCriteria : function(selectedAreas, selectedSpecializations, keyWords){
            var criteria = {},
                _selectedAreas = HHApi.getRegionsByNames(selectedAreas);
                _selectedSpecializations = HHApi.getSpecializationsByNames(selectedSpecializations);

            //console.log('VacancyCriteriaBuilder.selectedAreas', _selectedAreas);
            _(_selectedAreas).each(function(item){
                (criteria.area instanceof Array)?'':criteria.area = [];
                criteria.area.push(item.id);
            });

            _(_selectedSpecializations).each(function(item){
                (criteria.specialization instanceof Array)?'':criteria.specialization = [];
                criteria.specialization.push(item.id);
            });

            criteria.text = keyWords;

            //console.log('VacancyCriteriaBuilder.buildCriteria', criteria, selectedAreas, _selectedAreas, selectedSpecializations, _selectedSpecializations);
            return criteria;
        }
    }
});