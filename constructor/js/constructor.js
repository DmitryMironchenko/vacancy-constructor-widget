var constructorApp = angular.module('VacancyWidgetConstructorApp', ['ngTagsInput', 'urlUtils', 'hhApi', 'commonControls', 'ngResource', 'colorpicker.module'])
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

function WidgetConstructorCtrl($scope, HHApi,$rootScope, VacancyCriteriaBuilder, UrlBuilder){
    $scope.version = '1.0.17';

    // Array of areas objects received from hh api endopint
    $scope.areas = [];
    // Array of areas that are selected currently. Is array of strings. Not a subarray of $scope.areas
    $scope.selectedAreas = [];

    // Array of entered keywords
    $scope.keyWords = '';

    // Specializations
    $scope.specializations = [];
    $scope.selectedSpecializations = [];

    $scope.widgetData = '';

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

    // Callback used for responding on filters changing. Updates vacancies list.
    var filtersCallback = function(){
        var criteria = VacancyCriteriaBuilder.buildCriteria(
            $scope.selectedAreas,
            $scope.selectedSpecializations,
            $scope.keyWords
        );

        console.log('$watch selectedAreas, selectedSpecializations, keyWords', criteria, _.some(criteria));
        if(_.some(criteria)){
            // don't search vacancies if nothing is selected in filters
            HHApi.searchVacancies(criteria)
                .then(function(resp){
                    $scope.vacancies = resp.items;
                });
        }else{
            console.log('Emptying vacancies list...');
            $scope.vacancies = [];
        }
        }

    // Callback used for responding on found vacancies list change. Calls to build widget link.
    var vacanciesChangeCallback = function(){
        console.log('...$watch borderColor, linksColor, vacancies, vacanciesAmount');
        $scope.widgetData = UrlBuilder.buildWidgetScriptTag($scope.selectedAreas, _($scope.vacancies).take($scope.vacanciesAmount), $scope.linksColor, $scope.borderColor);
        $('.widget-preview').empty().append($scope.widgetData);
    };

    // No keyboard input
    _(['selectedAreas', 'selectedSpecializations']).each(function(item){
        $scope.$watch(item, filtersCallback, true)
    });
    // Watch keywords with debounce because of keyboard input
    $scope.$watch('keyWords', _.debounce(filtersCallback, 1000), true);


    // Has keyboard input
    _(['borderColor', 'linksColor']).each(function(item){
        $scope.$watch(item, _.debounce(vacanciesChangeCallback, 1000), true)
    });
    // No keyboard input
    _(['vacancies','vacanciesAmount']).each(function(item){
        $scope.$watch(item, vacanciesChangeCallback, true);
    });
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