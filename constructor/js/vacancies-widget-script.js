(function main(){
    // 1. Parse url params
    // 2. Extend defaults with url params
    // 3. Define template
    // 4. Render template


    // 1. Parsing url params
    var els = document.getElementsByTagName('script'),
        re =  /.*vacancies-widget-script\.?js/,
        foundEls = [],
        element;



    for(var i = 0; i < els.length; i++) {
        var el = els[i];

        if(el.src.match(re) && foundEls.indexOf(el) < 0) {
            foundEls.push(el);
            //console.log('Identified embed tag %o', el);
        }
    }

    console.log('Found Elements', foundEls);
    element = foundEls[0];

    var parseQueryString = function(url) {
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

        return deparam(url);
    };

    // And in the script tags loop
    var info = parseQueryString(foundEls[0].src.split('?').length > 1 ? foundEls[0].src.split('?')[1]:'');
    console.log("QueryString parsed", info);

    var newElement = document.createElement("aside"),
        styleElement = document.createElement("style");


    styleElement.setAttribute("type", "text/css");
    styleElement.innerHTML = ".vacanciesWidget,.vacanciesWidget *{animation:none;animation-delay:0;animation-direction:normal;animation-duration:0;animation-fill-mode:none;animation-iteration-count:1;animation-name:none;animation-play-state:running;animation-timing-function:ease;backface-visibility:visible;background:0;background-attachment:scroll;background-clip:border-box;background-color:transparent;background-image:none;background-origin:padding-box;background-position:0 0;background-position-x:0;background-position-y:0;background-repeat:repeat;background-size:auto auto;border:0;border-style:none;border-width:medium;border-color:inherit;border-bottom:0;border-bottom-color:inherit;border-bottom-left-radius:0;border-bottom-right-radius:0;border-bottom-style:none;border-bottom-width:medium;border-collapse:separate;border-image:none;border-left:0;border-left-color:inherit;border-left-style:none;border-left-width:medium;border-radius:0;border-right:0;border-right-color:inherit;border-right-style:none;border-right-width:medium;border-spacing:0;border-top:0;border-top-color:inherit;border-top-left-radius:0;border-top-right-radius:0;border-top-style:none;border-top-width:medium;bottom:auto;box-shadow:none;box-sizing:content-box;caption-side:top;clear:none;clip:auto;color:inherit;columns:auto;column-count:auto;column-fill:balance;column-gap:normal;column-rule:medium none currentColor;column-rule-color:currentColor;column-rule-style:none;column-rule-width:none;column-span:1;column-width:auto;content:normal;counter-increment:none;counter-reset:none;cursor:auto;direction:ltr;display:inline;empty-cells:show;float:none;font:400;font-family:inherit;font-size:medium;font-style:normal;font-variant:normal;font-weight:400;height:auto;hyphens:none;left:auto;letter-spacing:normal;line-height:normal;list-style:none;list-style-image:none;list-style-position:outside;list-style-type:disc;margin:0;margin-bottom:0;margin-left:0;margin-right:0;margin-top:0;max-height:none;max-width:none;min-height:0;min-width:0;opacity:1;orphans:0;outline:0;outline-color:invert;outline-style:none;outline-width:medium;overflow:visible;overflow-x:visible;overflow-y:visible;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;page-break-after:auto;page-break-before:auto;page-break-inside:auto;perspective:none;perspective-origin:50% 50%;position:static;quotes:'\201C' '\201D' '\2018' '\2019';right:auto;tab-size:8;table-layout:auto;text-align:inherit;text-align-last:auto;text-decoration:none;text-decoration-color:inherit;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-shadow:none;text-transform:none;top:auto;transform:none;transform-style:flat;transition:none;transition-delay:0s;transition-duration:0s;transition-property:none;transition-timing-function:ease;unicode-bidi:normal;vertical-align:baseline;visibility:visible;white-space:normal;widows:0;width:auto;word-spacing:normal;z-index:auto}.vacanciesWidget{width:200px;border:1px solid #" + (info.borderColor ? info.borderColor : 'eee') + ";background-color:#fff;padding:20px;display:table}.vacanciesWidget_header{display:block;font-family:Arial;font-size:14px;color:#333;margin-bottom:10px}.vacanciesWidget_regionsList{display:block;list-style-type:none}.vacanciesWidget_regionsList_region{display:block;font-family:Arial}.vacanciesWidget_regionsList_region:first-child{margin-left:0}.vacanciesWidget_regionsList_region{font-size:14px;font-weight:700;color:#333}.vacanciesWidget_vacanciesList{display:block;list-style:none}.vacanciesWidget_vacanciesList_vacancyName{display:block;margin:10px 0 0}.vacanciesWidget_all-vacancies{color:#" + (info.linksColor ? info.linksColor : '009cd5') + ";font-size:16px;font-family:Arial}.vacanciesWidget_vacanciesList_vacancyName>a{color:#" + (info.linksColor ? info.linksColor : '009cd5') + ";font-size:14px;font-family:Arial}.vacanciesWidget_vacanciesList_vacancyName>a:hover{color:#c00}.vacanciesWidget_vacanciesList_vacancyDescription>span{font-size:12px;line-height:16px;color:#888;font-family:Arial}";

    newElement.className = "vacanciesWidget";

    // HTML to be inserted
    var innerHTML = '';

    if(info.regions && info.regions.length > 0 && info.vacancies && info.vacancies.length){
        /**/
        innerHTML +=
             '<h4 class="vacanciesWidget_header">Вакансии в регион' + (info.regions.length == 1 ? 'е' : 'ах') + '</h4>'
            +'<ul class="vacanciesWidget_regionsList">';

        for(var i in info.regions){
            var r = info.regions[i];
            innerHTML += '<li class="vacanciesWidget_regionsList_region">' + r + '</li>';
        }
        innerHTML += '</ul>';
        /**/
    }
    if(info.regions && info.regions.length == 0 && info.vacancies && info.vacancies.length == 0 || !info.regions && !info.vacancies){
        innerHTML +=
            '<a href="http://hh.ru" class="vacanciesWidget_all-vacancies">Вакансии на hh.ru</a>';
    }

    if(info.vacancies && info.vacancies.length > 0){
        innerHTML +=
            '<dl class="vacanciesWidget_vacanciesList">';

        for(var i in info.vacancies){
            var v = info.vacancies[i];
            innerHTML +=
                 '<dt class="vacanciesWidget_vacanciesList_vacancyName"><a href="' + v.link + '" target="_blank">' + v.name + '</a></dt>'
                 +'<dd class="vacanciesWidget_vacanciesList_vacancyDescription">'
                     +'<span class="vacanciesWidget_vacanciesList_vacancyDescription_salary">' +
                    (v.salary && v.salary.from ? 'от ' + v.salary.from : '') +
                    (v.salary && v.salary.to ? (v.salary && v.salary.from ? ' ': '') + 'до ' + v.salary.to : '') +
                    (v.salary ? ' ' + v.salary.currency : '') +
                    (v.salary ? ', ': '') +
                    '</span> <span class="vacanciesWidget_vacanciesList_vacancyDescription_employer">' + v.employerName + '</span></dd>'
            ;
        }
        innerHTML +=
            '</dl>';
    }
    newElement.innerHTML = innerHTML;
    document.getElementsByTagName('head')[0].appendChild(styleElement);

    element.parentNode.insertBefore(newElement, element.nextSibling);
})();