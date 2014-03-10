var constructorApp = angular.module('VacancyWidgetConstructorApp', ['ngTagsInput', 'urlUtils', 'hhApi', 'commonControls'])
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

function WidgetConstructorCtrl($scope, VacanciesConstructor, HHApi,$rootScope){
    $scope.areas = [];
    $scope.selectedareas = [];


    $scope.keyWords = VacanciesConstructor.buildLink();

    $scope.loadRegionsSuggestion = function(query){
        return HHApi.searchRegions(query);
    }

    HHApi.getRegions()
        .then(function(data){$scope.areas = data;});

    HHApi.getSpecializations()
        .then(function(data){
            //console.log('Specializations received', data);
        });

    $scope.$on("ITEMS_SELECTED", function(e, args){
        console.log('ITEMS_SELECTED event caught in main controller', args.items, $scope.selectedareas, _.union($scope.selectedareas, args.items));

        $scope.selectedareas = angular.copy(_.union($scope.selectedareas, args.items));

        // very bad approach
        $('.tag-input').focus().blur();
    });

    $scope.$watchCollection('selectedareas', function(newVal, oldVal){
        console.log('$scope.selectedareas changed', $scope.selectedareas);
    }, true);
}

constructorApp.factory('VacanciesConstructor', function(Serialization){
    return {
        buildLink : function(professionalAreas, keyWords, regions, vacanciesAmount, borderColor, linkColor){
            return "http://google.com";
        }
    }
});
constructorApp.factory('Serialization', function(){
    var undef;
    // A handy reference.
    var decode = decodeURIComponent;

    /**
     * Deserializes url and retrieves js object filled with data
     * @param text text to parse
     * @returns {{}}
     */
    var deparam = function(text) {
        // The object to be returned.
        var result = {};
        // Iterate over all key=value pairs.
        (text.replace(/\+/g, ' ').split('&').forEach(function(pair, index) {
            // The key=value pair.
            var kv = pair.split('=');
            // The key, URI-decoded.
            var key = decode(kv[0]);
            // Abort if there's no key.
            if ( !key ) { return; }
            // The value, URI-decoded. If value is missing, use empty string.
            var value = decode(kv[1] || '');
            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
            var keys = key.split('][');
            var last = keys.length - 1;
            // Used when key is complex.
            var i = 0;
            var current = result;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if ( keys[0].indexOf('[') >= 0 && /\]$/.test(keys[last]) ) {
                // Remove the trailing ] from the last keys part.
                keys[last] = keys[last].replace(/\]$/, '');
                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);
                // Since a key part was added, increment last.
                last++;
            } else {
                // Basic 'foo' style key.
                last = 0;
            }
            /*
            if ( typeof(reviver) == "function" ) {
                // If a reviver function was passed, use that function.
                value = reviver(key, value);
            } else if ( reviver ) {
                // If true was passed, use the built-in $.deparam.reviver function.
                value = deparam.reviver(key, value);
            }
            */
            if ( last ) {
                // Complex key, like 'a[]' or 'a[b][c]'. At this point, the keys array
                // might look like ['a', ''] (array) or ['a', 'b', 'c'] (object).
                for ( ; i <= last; i++ ) {
                    // If the current key part was specified, use that value as the array
                    // index or object key. If omitted, assume an array and use the
                    // array's length (effectively an array push).
                    key = keys[i] !== '' ? keys[i] : current.length;
                    if ( i < last ) {
                        // If not the last key part, update the reference to the current
                        // object/array, creating it if it doesn't already exist AND there's
                        // a next key. If the next key is non-numeric and not empty string,
                        // create an object, otherwise create an array.
                        current = current[key] = current[key] || (isNaN(keys[i + 1]) ? {} : []);
                    } else {
                        // If the last key part, set the value.
                        current[key] = value;
                    }
                }
            } else {
                // Simple key.
                if ( result[key] instanceof Array ) {
                    // If the key already exists, and is an array, push the new value onto
                    // the array.
                    result[key].push(value);
                } else if ( key in result ) {
                    // If the key already exists, and is NOT an array, turn it into an
                    // array, pushing the new value onto it.
                    result[key] = [result[key], value];
                } else {
                    // Otherwise, just set the value.
                    result[key] = value;
                }
            }
        }));

        return result;
    };

    return {
        deparam: function(text){
            return deparam(text)
        },

        // jQuery param function
        param: $.param
    }
});