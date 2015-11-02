import s = require('../JDebugServer');
import w = require('../Watcher');
import utils = require('../Utils');

class CssHandler implements s.IJDebugFileHandler {

    filemasks = ['**/*.css'];
    scope = s.FileHandlerScope.APP;

    constructor(private server:s.JDebugServer) {

    }

    fileChanged(info:w.IFileInfo):boolean {
        if (this.isStyleSheet(info.filepath)) {

            this.server.broadcast({
                type: s.JDebugCommandType.CSSCHANGED,
                data: utils.convertPathClient(info.filepath)
            }, true);
            utils.log('css change detected: '+ info.filepath);
            return true; // intercepted
        }
        return false;
    }

    private isStyleSheet(filepath:string):boolean {
        return utils.getFileExtension(filepath).toUpperCase() === '.CSS';
    }
}

export = CssHandler;