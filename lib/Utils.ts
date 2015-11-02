import fs = require('fs');
import path = require('path');


/**
 * Reads JSON from file
 */
export function readJSON(filename:string) {
    if (!fileExists(filename)) {
        throw new Error('File not found at: ' + filename);
    }
    return JSON.parse(readFile(filename));
}

export function readFile(filename:string):string {
    var content = fs.readFileSync(filename, {encoding: 'utf8'});
    content = content.replace(/^\uFEFF/, ''); //remove BOM
    return content;
}

export function fileExists(filepath:string):boolean {
    try {
        return fs.statSync(filepath).isFile();
    }
    catch (err) {
        return false;
    }
}

/**
 * component-name --> componentName
 */
export function camelCaseTagName(tagName:string):string {
    if (tagName.indexOf('-') < 0) {
        return camelCase(tagName);
    }

    return tagName.replace(/\-(\w)/g, function (match, letter) {
        return letter.toUpperCase();
    });
}

/**
 * ComponentName --> componentName
 */
export function camelCase(name:string):string {
    var regex = /[A-Z]/g;
    return name.replace(regex, function (letter, pos) {
        return pos ? letter : letter.toLowerCase();
    });
}

/**
 *  C:\folder\file.exe --> folder
 */
export function getParentFolderName(filepath:string):string {
    var path = convertPathClient(getPath(filepath));
    return path.match(/([^\/]*)\/*$/)[1];
}

/**
 *  C:\folder\file.exe --> C:\folder\
 */
export function getPath(filepath:string):string {
    return path.dirname(filepath);
}

export function getFileExtension(filepath:string):string {
    return path.extname(filepath);
}

export function convertPathClient(filepath:string):string {
    var path = filepath.replace(/\\/g, '/');
    return path;
}

export function dateDiffInMilliseconds(d1:Date, d2:Date):number {
    return d2.getTime() - d1.getTime();
}

export function findDefinition(filepath):any {
    var defPath = path.join(getPath(filepath), '_definition.json');
    if (!fileExists(defPath)) {
        return undefined;
    }
    try {
        return readJSON(defPath);
    }
    catch (e) {
        return undefined;
    }
}

export function determineComponentName(filepath:string):string {
    var def = findDefinition(filepath);
    if (!def) return undefined;

    if (def.name) {
        return def.name;
    }
    return camelCaseTagName(getParentFolderName(filepath));
}

export function determineAreaName(filepath):any {
    var pathToCheck = path.join(getPath(filepath), '_area.json');

    if (!fileExists(pathToCheck)) {
        var parent = path.dirname(filepath);
        if (!parent) {
            return undefined;
        }
        return determineAreaName(parent);
    }
    var areaDef = undefined;
    try {
        areaDef = readJSON(pathToCheck);
    }
    catch (e) {
        log(`Error occured during parsing '${pathToCheck}': ${e}`);
        return undefined;
    }

    return areaDef.name || getParentFolderName(pathToCheck);
}

export function log(message:string) {
    console.log('jDebug:', message);
}

export function getDirPath(filepath:string) {
    return path.dirname(filepath);
}

export function getFilename(filepath:string):string {
    return path.basename(filepath);
}

export function convertToClientDefinition(def:any, filepath:string) {

    if (!def.name) {
        def.name = determineComponentName(filepath);
    }

    if (def.templateFile) {
        var serverPath = path.join(getDirPath(filepath), def.templateFile);
        def.templateUrl = convertPathClient(serverPath);
        delete def.templateFile;
    }

    if (def.properties || def.events) {
        if (def.properties) {
            def.properties = splitStringBySpace(def.properties);
        }
        else {
            delete def.properties;
        }

        if (def.events) {
            def.events = splitStringBySpace(def.events);
        } else {
            delete def.events;
        }
    }
    else {
        if (def.attributes) {
            def.attributes = getJasperAttributes(def.attributes);
        } else {
            delete def.attributes;
        }

        delete def.properties;
        delete def.events;
    }

    return def;

}

export function getJasperAttributes(attrs) {
    if (typeof (attrs) === 'string') {
        var resultAttrs = [];

        var attrsParts = attrs.split(' ');
        attrsParts.forEach(function (part) {
            var indx = part.indexOf(':');
            if (indx > -1) {
                // attr type specified
                var attrName = part.substring(0, indx);
                var attrType = part.substring(indx + 1, part.length);
                resultAttrs.push({name: attrName, type: attrType});
            } else {
                resultAttrs.push({name: part});
            }
        });

        return resultAttrs;
    }
    return attrs;
}

export function splitStringBySpace(props) {
    if (typeof (props) === 'string') {
        return props.split(' ').map(function (item) {
            var i = item.trim();
            return i ? i : null;
        }).filter(function (i) {
            return i;
        });
    }
    return props;
}

export function getFileModifiedDate(filepath):Date {
    return new Date(fs.statSync(filepath).mtime);
}

/* return page if component is not found */
export function extractComponentFromArrayDefinition(def) {
    for (var elem of def) {
        if (elem.type && elem.type === 'component' || elem.type === 'page') {
            return elem;
        }
    }
    return null;
}

export function isArray(arr:any) {
    if (Array.isArray) {
        return Array.isArray(arr);
    } else {
        return arr instanceof Array;
    }
}