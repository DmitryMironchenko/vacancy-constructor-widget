var commonControls = angular.module('commonControls', [], function() {});

commonControls.directive('treeView', function(){
    function _convertDataForTreeView(data, childrenFieldName){
        /*
        convertedData = [{
            span: {html: 'Pizdec 1'},
            children: [{
                span: {html: 'Pizdec 1.1'}
            },{
                span: {html: 'Pizdec 1.2'}
            }]
        },{
            span: {html: 'Pizdec 2'}
        }]
        */
        var convertedData = [];

        _(data).each(function(item){
            var newItem = {span:{html: item.name}},
                func = arguments.callee;
            item[childrenFieldName]?newItem.children = []:'';

            _(item[childrenFieldName]).each(function(_newItem){
                func.call(newItem.children, _newItem);
            });

            this.push(newItem);
        }, convertedData);

        return convertedData;
    }

    var convertDataForTreeView = _.memoize(_convertDataForTreeView);

    return {
        restrict: 'E',
        //templateUrl: 'templates/tree-view.html',
        template: '<div class="tree"></div>',
        require: ['treeView', '?^modalDialog'],

        scope: {
            'data': '=data',
            'itemsSelected': '&',
            'name': '@'
        },

        controller: function($scope){
            this.submitData = function(){
                checkedItems = _($scope.linkElement.find('.tree:eq(0) input:checked').next()).map(function(item){return item.innerHTML;});
                $scope.itemsSelected({data: checkedItems});
            }

            // Render tree only on dialog open event
            this.renderTree = function(){
                $scope.linkElement.find('.tree:eq(0)')
                    .tree({
                        dnd: false,
                        onCheck: {
                            ancestors: 'uncheck',
                            descendants: 'uncheck'
                        },
                        components: ['checkbox'],
                        nodes: $scope.nodes,
                        collapseEffect: 'blind',
                        expandEffect: 'blind',
                        collapseDuration: 1,
                        expandDuration: 1
                    });
            }
        },

        compile: function($templateElement, $templateAttributes){
            return function linkingFunction($scope, $linkElement, $linkAttributes, controllers){
                $scope.checkedItems = [];
                if(angular.isArray(controllers) && controllers.length > 1){
                    // Register close listener in parent modalDialog controller
                    controllers[1].registerCloseListener(controllers[0].submitData);
                    controllers[1].registerShowListener(controllers[0].renderTree);
                }
                $scope.linkElement = $linkElement;

                $scope.$watch('data', function(){
                    if($scope.data.length > 0){
                        $scope.nodes = convertDataForTreeView($scope.data, $scope.name);
                    }
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
        scope: {
            modalTitle: '@title',
            modalOk: '@ok',
            modalCancel: '@cancel'
        },
        controller: function($scope){
            // List of callbacks that subscribed to dialog close event
            $scope.closeListeners = [],
            $scope.showListeners = [];

            this.registerCloseListener = function(listener){
                $scope.closeListeners.push(listener);
            }

            this.registerShowListener = function(listener){
                $scope.showListeners.push(listener);
            }

            this.onClose = function(){
                _($scope.closeListeners).each(function(item){
                    item.apply(this);
                })
            };
            this.onShow = function(){
                _($scope.showListeners).each(function(item){
                    item.apply(this);
                })
            };
        },

        compile: function($templateElement, $templateAttributes){
            return function linkingFunction($scope, $linkElement, $linkAttributes, ctrl){
                $scope._id = Math.round(Math.random() * 10000);

                $linkElement.find('.modal')
                    .on('hide.bs.modal', function(e){
                        ctrl.onClose();
                    })
                    .on('show.bs.modal', function(e){
                        ctrl.onShow();
                    });
            }
        }
    };
});