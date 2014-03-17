var commonControls = angular.module('commonControls', [], function() {});

commonControls.directive('treeView', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/tree-view.html',
        require: ['treeView', '?^modalDialog'],

        scope: {
            'data': '=data',
            'itemsSelected': '&',
            'name': '@'
        },

        controller: function($scope){
            this.submitData = function(){
                //console.log('Treeview ready to be submitted after dialog closed', $scope.data);

                checkedItems = [];

                _($scope.data).each(function(item){
                    if(item.checked){checkedItems.push(item.name)};
                    _(item[$scope.name]).each(arguments.callee, item);
                });

                //console.log('Treeview ready to be submitted after dialog closed', $scope.data, checkedItems);

                $scope.itemsSelected({data: checkedItems});
            }
        },

        compile: function($templateElement, $templateAttributes){
            //console.log('treeView compile', $templateElement);

            return function linkingFunction($scope, $linkElement, $linkAttributes, controllers){
                $scope.checkedItems = [];
                if(angular.isArray(controllers) && controllers.length > 1){
                    //console.log('Trying to register a close listener', $scope);
                    controllers[1].registerCloseListener(controllers[0].submitData);
                }

                setTimeout(function(){$linkElement.find('.tree:eq(0)').tree({
                    onCheck: {
                        ancestors: 'uncheck',
                        descendants: 'uncheck'
                    }
                });}, 1000);

                setTimeout(function(){
                    //console.log('treeView data', $scope.data);
                }, 1000);
            }
        }
    };
});

commonControls.directive('modalDialog', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/modal-dialog.html',
        transclude: true,
        scope: {
            modalTitle: '@title',
            modalOk: '@ok',
            modalCancel: '@cancel'
        },
        controller: function($scope){
            //console.log('modalDialog.Controller');
            $scope.closeListeners = [];

            this.registerCloseListener = function(listener){
                //console.log('modalDialog.registerCloseListener');
                $scope.closeListeners.push(listener);
            }

            this.onClose = function(){
                _($scope.closeListeners).each(function(item){
                    //console.log('Calling modalDialog.onClose');
                    item.apply(this);
                })
            };
        },

        compile: function($templateElement, $templateAttributes){
            return function linkingFunction($scope, $linkElement, $linkAttributes, ctrl){
                $scope._id = Math.round(Math.random() * 10000);

                $linkElement.find('.modal').on('hide.bs.modal', function(e){

                    ctrl.onClose();
                });
            }
        }
    };
});