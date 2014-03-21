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

function WidgetConstructorCtrl($scope, HHApi,$rootScope, VacancyCriteriaBuilder, UrlBuilder, filterFilter){
    $scope.version = '1.0.19';

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
            $scope.areas = angular.copy(data);

            $scope.loadRegionsSuggestion = function(query){
                return HHApi.searchRegions(query);
            }
        });
    HHApi.getSpecializations()
        .then(function(data){
            $scope.specializations = data;
        });

    // TODO: compact code
    HHApi.getDictionary('employment')
        .then(function(data){
            $scope.employment = data;
        });

    HHApi.getDictionary('schedule')
        .then(function(data){
            $scope.schedule = data;
        });

    HHApi.getDictionary('experience')
        .then(function(data){
            $scope.experience = data;
        });

    HHApi.getDictionary('currency')
        .then(function(data){
            $scope.currency = data;
            $scope.selectedCurrency = $scope.currency[0];
        });


    $scope.specializationsSelected = function(data){
        $scope.selectedSpecializations = angular.copy(_.union($scope.selectedSpecializations, data));

        // very bad approach
        $('.tag-input').focus().blur();
    }

    $scope.regionsSelected = function(data){
        $scope.selectedAreas = angular.copy(_.union($scope.selectedAreas, data));

        // very bad approach
        $('.tag-input').focus().blur();
    }

    // Callback used for responding on filters changing. Updates vacancies list.
    var filtersCallback = function(){
        var criteria = VacancyCriteriaBuilder.buildCriteria(
            $scope.selectedAreas,
            $scope.selectedSpecializations,
            $scope.keyWords,
            filterFilter($scope.employment,{selected:true}),
            filterFilter($scope.schedule,{selected:true}),
            $scope.selectedExperience,
            $scope.hideVacanciesWithoutSalary,
            $scope.salary,
            $scope.selectedCurrency
        );

        if(_.some([$scope.selectedAreas.length>0, $scope.selectedSpecializations.length>0, $scope.keyWords!=''])){
            // don't search vacancies if nothing is selected in filters
            HHApi.searchVacancies(criteria)
                .then(function(resp){
                    $scope.vacancies = resp.items;
                });
        }else{
            $scope.vacancies = [];
        }
    }

    // Callback used for responding on found vacancies list change. Calls to build widget link.
    var vacanciesChangeCallback = function(){
        $scope.widgetData = UrlBuilder.buildWidgetScriptTag($scope.selectedAreas, _($scope.vacancies).take($scope.vacanciesAmount), $scope.linksColor, $scope.borderColor);
        $('.widget-preview').empty().append($scope.widgetData);
    };

    // No keyboard input
    _(['selectedAreas',
        'selectedSpecializations',
        'employment|filter:{selected:true}',
        'schedule|filter:{selected:true}',
        'selectedExperience',
        'hideVacanciesWithoutSalary',
        'selectedCurrency']).each(function(item){
        $scope.$watch(item, filtersCallback, true)
    });
    // Watch keywords with debounce because of keyboard input
    _(['keyWords', 'salary']).each(function(item){
        $scope.$watch(item, _.debounce(filtersCallback, 1000), true);
    });

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
        buildCriteria : function(selectedAreas, selectedSpecializations, keyWords, employmentTypes, scheduleTypes, selectedExperience, hideVacanciesWithoutSalary, salary, selectedCurrency){
            var criteria = {},
                _selectedAreas = HHApi.getRegionsByNames(selectedAreas);
                _selectedSpecializations = HHApi.getSpecializationsByNames(selectedSpecializations);

            // TODO: compact code
            _(_selectedAreas).each(function(item){
                (criteria.area instanceof Array)?'':criteria.area = [];
                criteria.area.push(item.id);
            });

            _(_selectedSpecializations).each(function(item){
                (criteria.specialization instanceof Array)?'':criteria.specialization = [];
                criteria.specialization.push(item.id);
            });

            _(employmentTypes).each(function(item){
                (criteria.employment instanceof Array)?'':criteria.employment = [];
                criteria.employment.push(item.id);
            });

            _(scheduleTypes).each(function(item){
                (criteria.schedule instanceof Array)?'':criteria.schedule = [];
                criteria.schedule.push(item.id);
            });

            criteria.experience = selectedExperience;
            criteria.only_with_salary = hideVacanciesWithoutSalary;
            criteria.salary = salary? salary.replace(/(\s)*(\.)*(,)*/gi, ''):salary;
            criteria.currency = criteria.salary ? selectedCurrency : undefined;

            criteria.text = keyWords;

            return criteria;
        }

        // TODO: add serializeCriteria method that will convert criteria object to part of url
    }
});