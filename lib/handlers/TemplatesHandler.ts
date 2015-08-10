import s = require('../JDebugServer');
import w = require('../Watcher');
import utils = require('../Utils');

interface ITemplateInfo {
    component: string;
    templateUrl: string;
}

class TemplatesHandler implements s.IJDebugFileHandler {

    constructor(private server:s.JDebugServer) {

    }

    fileChanged(info:w.IChangedFileInfo):boolean {
        if (this.isTemplate(info.filepath)) {

            var def = utils.findDefinition(info.filepath);

            if(utils.isArray(def)) {
                def = utils.extractComponentFromArrayDefinition(def);
            }

            if (this.isTypeSupported(def.type) && def.templateFile) {
                if(utils.getFilename(info.filepath).toUpperCase() === def.templateFile.toUpperCase()){
                    var data:ITemplateInfo = {
                        templateUrl: utils.convertPathClient(info.filepath),
                        component: utils.determineComponentName(info.filepath)
                    };
                    this.server.broadcast({
                        type: s.JDebugCommandType.TEMPLATECHANGED,
                        data: data
                    });

                    utils.log('template change detected: '+ info.filepath);
                }
            }

            return true; // intercepted
        }
        return false;
    }

    private isTypeSupported(type: string){
        return type === 'component' || type === 'page';
    }

    private isTemplate(filepath:string):boolean {
        return utils.getFileExtension(filepath).toUpperCase() === '.HTML';
    }
}

export = TemplatesHandler;