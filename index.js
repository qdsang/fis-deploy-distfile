
'use strict'

var allRet;

//project root
var root;
var ns;
var setting = {};

var _ = fis.util;


// create <ns>.data.php
function genData(opt) {
    var ids = allRet.ids;
    var data = {};
    _.map(ids, function(id, file) {
        //只对JS起效
        if (file.rExt == '.js') {
            data[id] = {
                'uri': file.getUrl(opt.hash, opt.domain),
                'content': file.getContent()
            };
        }
    });
    var dataFile = fis.file(root, '/webapp/' + (ns ? ns + '-' : '') + 'data.json');
    dataFile.useHash = false;
    dataFile.setContent(JSON.stringify(data), null, opt.optimize ? null : 4);
    allRet.pkg[dataFile.subpath] = dataFile;
}


function roadmap(subpath, obj){
    var map = setting.path || [], path = 'path';
    for(var i = 0, len = map.length; i < len; i++){
        var opt = map[i], reg = opt.reg;
        if(reg){
            if(typeof reg === 'string'){
                reg = fis.util.glob(replaceDefine(reg, true));
            } else if(!fis.util.is(reg, 'RegExp')){
                fis.log.error('invalid regexp [' + reg + '] of [deploy-distfile setting.' + path + '.' + i + ']');
            }
            var matches = subpath.match(reg);
            if(matches){
                obj = obj || {};
                fis.uri.replaceProperties(opt, matches, obj);
                delete obj.reg;
                return obj;
            }
        } else {
            fis.log.error('[deploy-distfile setting.' + path + '.' + i + '] missing property [reg].');
        }
    }
    return false;
}

module.exports = function(ret, conf, settings, opt) {
    setting = settings;
    root = fis.project.getProjectPath();
    ns = fis.config.get('namespace');

    settings = {
        path : [
            {
                reg: /^\//,
                dists: []
            }
        ]
    };

    _.map(ret.src, function(_path, file) {
        var file2 = roadmap(_path, {});

    });

    //create map.json
    var map = fis.file(root, (ns ? ns + '-' : '') + 'map.json');
    map.useHash = false;
    map.setContent(JSON.stringify(ret.map), null, opt.optimize ? null : 4);
    ret.pkg[map.subpath] = map;
    //create data.json
    if (settings['create'] && settings['create'].indexOf('data.json') != -1) {
        allRet = ret;
        genData(opt);
    }
};
