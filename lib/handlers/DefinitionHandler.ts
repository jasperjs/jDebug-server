import s = require('../JDebugServer');
import w = require('../Watcher');
import utils = require('../Utils');

class DefinitionHandler implements s.IJDebugFileHandler {

    constructor(private server:s.JDebugServer) {

    }

    fileChanged(info:w.IChangedFileInfo):boolean {
        if (this.isDefinition(info.filepath)) {
            var def = utils.findDefinition(info.filepath);
            if (def && this.isTypeSupported(def.type)) {
                this.server.broadcast({
                    type: s.JDebugCommandType.DEFINITIONCHANGED,
                    data: utils.convertToClientDefinition(def, info.filepath)
                });
                utils.log('_defintion.json change detected: '+ info.filepath);
            }
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