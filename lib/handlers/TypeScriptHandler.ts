import s = require('../JDebugServer');
import w = require('../Watcher');
import utils = require('../Utils');

class TypeScriptHandler implements s.IJDebugFileHandler {

    private defers = {};

    constructor(private server:s.JDebugServer) {

    }

    fileChanged(info:w.IChangedFileInfo):boolean {

        if (this.isTypeScript(info.filepath)) {
            if (this.defers[info.filepath]) {
                clearInterval(this.defers[info.filepath]);
            }

            var checks = 0, maxChecks = 20;
            var jsFilepath = info.filepath.slice(0, -2) + 'js';
            var tsModifiedDate = utils.getFileModifiedDate(info.filepath);

            var def = utils.findDefinition(info.filepath);
            if (def && this.isTypeSupported(def.type)) {

                this.defers[info.filepath] = setInterval(()=> {
                    checks++;
                    if (checks > maxChecks) {
                        clearInterval(this.defers[info.filepath]);
                        this.defers[info.filepath] = null;
                        return;
                    }

                    if (!utils.fileExists(jsFilepath)) {
                        return;
                    }

                    var jsModifiedDate = utils.getFileModifiedDate(jsFilepath);

                    if (jsModifiedDate >= tsModifiedDate) {
                        // js file changed (compiled)
                        utils.log('typescript compile detected:' + info.filepath);
                        clearInterval(this.defers[info.filepath]);
                        this.defers[info.filepath] = null;
                        // send to client
                        this.server.broadcast({
                            type: s.JDebugCommandType.CTRLCHANGED,
                            data: {
                                src: utils.convertPathClient(jsFilepath),
                                def: utils.convertToClientDefinition(def, info.filepath)
                            }
                        });

                    }

                }, 300);

            }

            return true;
        }

        // todo place logic here; this.server.broadcast(....);
        console.log('file changed: ', info.filepath);
        return false;
    }

    private isTypeSupported(type: string){
        return type === 'component' || type === 'page';
    }

    private isTypeScript(filepath:string):boolean {
        return utils.getFileExtension(filepath).toUpperCase() === '.TS';
    }

}

export = TypeScriptHandler;