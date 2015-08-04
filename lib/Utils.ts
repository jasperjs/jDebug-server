import fs = require('fs');
import path = require('path');

class Utils {

    /**
     * Reads JSON from file
     */
    readJSON(filename:string) {
        if (!this.fileExists(filename)) {
            throw new Error('File not found at: ' + filename);
        }
        return JSON.parse(fs.readFileSync(filename, 'utf8'))
    }

    fileExists(filepath:string):boolean {
        return fs.existsSync(filepath);
    }

    /**
     * component-name --> componentName
     */
    camelCaseTagName(tagName:string):string {
        if (tagName.indexOf('-') < 0) {
            return this.camelCase(tagName);
        }

        return tagName.replace(/\-(\w)/g, function (match, letter) {
            return letter.toUpperCase();
        });
    }

    /**
     * ComponentName --> componentName
     */
    camelCase(name:string):string {
        var regex = /[A-Z]/g;
        return name.replace(regex, function (letter, pos) {
            return pos ? letter : letter.toLowerCase();
        });
    }

    /**
     *  C:\folder\file.exe --> folder
     */
    getParentFolderName(filepath:string):string {
        var path = this.convertPathClient(this.getPath(filepath));
        return path.match(/([^\/]*)\/*$/)[1];
    }

    /**
     *  C:\folder\file.exe --> C:\folder\
     */
    getPath(filepath:string):string {
        return filepath.substring(0, filepath.lastIndexOf('\\'));
    }

    getFileExtension(filepath:string):string {
        return path.extname(filepath);
    }

    convertPathClient(filepath:string):string {
        var path = filepath.replace(/\\/g, '/');
        return path;
    }

    dateDiffInMilliseconds(d1:Date, d2:Date):number {
        return d2.getTime() - d1.getTime();
    }

    findDefinition(filepath):any {
        var defPath = path.join(this.getPath(filepath), '_definition.json');
        if (!this.fileExists(defPath)) {
            return undefined;
        }
        try {
            return this.readJSON(defPath);
        }
        catch(e){
            return undefined;
        }
    }

    determineComponentName(filepath:string):string {
        var def = this.findDefinition(filepath);
        if (!def) return undefined;

        if (def.name) {
            return def.name;
        }
        return this.camelCaseTagName(this.getParentFolderName(filepath));
    }

    log(message: string){
        console.log('jDebug:', message);
    }

    getDirPath(filepath: string){
        return path.dirname(filepath);
    }

    getFilename(filepath:string):string {
        return path.basename(filepath);
    }

    convertToClientDefinition(def:any, filepath: string) {

        if (!def.name) {
            def.name = this.determineComponentName(filepath);
        }

        if (def.templateFile) {
            var serverPath = path.join(this.getDirPath(filepath), def.templateFile);
            def.templateUrl = this.convertPathClient(serverPath);
            delete def.templateFile;
        }

        if (def.properties || def.events) {
            if (def.properties) {
                def.properties = this.splitStringBySpace(def.properties);
            }
            else {
                delete def.properties;
            }

            if (def.events) {
                def.events = this.splitStringBySpace(def.events);
            } else {
                delete def.events;
            }
        }
        else {
            if (def.attributes) {
                def.attributes = this.getJasperAttributes(def.attributes);
            } else {
                delete def.attributes;
            }

            delete def.properties;
            delete def.events;
        }

        return def;

    }

    getJasperAttributes(attrs) {
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

    splitStringBySpace(props) {
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

    getFileModifiedDate(filepath): Date {
        return new Date(fs.statSync(filepath).mtime);
    }

    /* return page if component is not found */
    extractComponentFromArrayDefinition(def){
        for(var elem of def){
            var pageElem = null;
            if(elem.type && elem.type === 'component'){
                return elem;
            } else if (elem.type && elem.type === 'page'){
                pageElem  = elem;
            }
            return pageElem;
        }

        return null;
    }

    isArray(arr:any){
        if(Array.isArray){
            return Array.isArray(arr);
        } else {
            return arr instanceof Array;
        }
    }
}

export =
new Utils();