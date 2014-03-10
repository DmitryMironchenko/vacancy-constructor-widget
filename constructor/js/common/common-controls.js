var commonControls = angular.module('commonControls', [], function() {});

commonControls.directive('treeView', function($compile, $rootScope){
    return {
        restrict: 'E',
        templateUrl: 'templates/tree-view.html',
        scope: {
            'areas': '=',
            'selectedareas': '='
        },

        compile: function($templateElement, $templateAttributes){
            console.log('treeView compile', $templateElement);

            return function linkingFunction($scope, $linkElement, $linkAttributes){
                console.log('treeView linkingFunction', $scope.areas, $scope.selectedAreas);

                setTimeout(function(){$linkElement.find('.tree:eq(0)').tree({
                    onCheck: {
                        ancestors: 'uncheck',
                        descendants: 'uncheck'
                    }/*,
                    onUncheck: {
                        descendants: 'uncheck'
                    }*/
                });}, 300);

                $scope.$on("DIALOG_CLOSED", function(e){
                    /*
                    $linkElement.find('.tree:eq(0)')
                        //.tree('uncheckAll')
                        .tree('collapseAll');
                    */

                    // get all checked items
                    var checkedItems = [];
                    _($scope.areas).each(function(item){
                        if(item.checked){checkedItems.push(item.name)};
                        _(item.areas).each(arguments.callee, item);
                    });

                    console.log('Dialog closed', $scope.areas, checkedItems);
                    $rootScope.$broadcast('ITEMS_SELECTED', {items: checkedItems});
                });
            }
        }
    };
});

commonControls.directive('modalDialog', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/modal-dialog.html',
        transclude: true,

        compile: function($templateElement, $templateAttributes){
            console.log('modalDialog compile', $templateElement);

            return function linkingFunction($scope, $linkElement, $linkAttributes){
                $scope._id = Math.round(Math.random() * 10000);


                $linkElement.find('.modal').on('hide.bs.modal', function(e){
                    $scope.$broadcast('DIALOG_CLOSED', {closed: true});
                });
            }
        }
    };
});