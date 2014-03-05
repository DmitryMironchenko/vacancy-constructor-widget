var urlUtils = angular.module('urlUtils', []);

urlUtils.factory('urlUtils', function(){
    var HH_API_DOMAIN = "https://api.hh.ru/";

    return {
        getHHApiUrl: function(path){
            return HH_API_DOMAIN + path.replace(/^\//, '');
        }
    }
});