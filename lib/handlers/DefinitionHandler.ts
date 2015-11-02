import s = require('../JDebugServer');
import w = require('../Watcher');
import utils = require('../Utils');
import build = require('../ProjectBuilder');

class DefinitionHandler implements s.IJDebugFileHandler {

    filemasks = ['**/_definition.json'];
    scope = s.FileHandlerScope.APP;

    constructor(private server:s.JDebugServer, private builder: build.ProjectBuilder) {

    }

    fileChanged(info:w.IFileInfo):boolean {
        if (this.isDefinition(info.filepath)) {
            var def = utils.findDefinition(info.filepath);

            if(utils.isArray(def)) {
                def = utils.extractComponentFromArrayDefinition(def);
            }

            if (def && this.isTypeSupported(def.type)) {
                this.server.broadcast({
                    type: s.JDebugCommandType.DEFINITIONCHANGED,
                    data: utils.convertToClientDefinition(def, info.filepath)
                });
                utils.log('_defintion.json change detected: '+ info.filepath);
            }
            this.builder.rebuildAreaByFile(info.filepath);
            return true; // intercepted
        }
        return false;
    }

    fileRemoved(info:w.IFileInfo):boolean {
        if (this.isDefinition(info.filepath)) {
            this.builder.rebuildAreaByFile(info.filepath);
            return true; // intercepted
        }
        return false;
    }

    fileAdded(info:w.IFileInfo):boolean {
        if (this.isDefinition(info.filepath)) {
            this.builder.rebuildAreaByFile(info.filepath);
            return true; // intercepted
        }
        return false;
    }

    private isDefinition(filepath:string):boolean {
        return utils.getFilename(filepath).toUpperCase() === '_DEFINITION.JSON';
    }

    private isTypeSupported(type: string){
        return type === 'component' || type === 'page';
    }

}

export = DefinitionHandler;