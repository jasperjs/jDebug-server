import w = require('./Watcher');
import ws = require('ws');


export interface IJDebugFileHandler {
    /**
     * Invokes then file is changed
     * @param info      Info of changed file
     * @returns         true if file processed
     */
    fileChanged(info:w.IChangedFileInfo): boolean;
}

export enum JDebugCommandType {
    TEMPLATECHANGED = 1,
    DEFINITIONCHANGED = 2,
    CTRLCHANGED = 3,
    CSSCHANGED = 4
}

export interface IJDebugCommand {
    type: JDebugCommandType;
    data: any;
}

export class JDebugServer {
    private handlers:IJDebugFileHandler[] = [];
    private ws:any;

    private defers = {};
    private flushPeriod = 500;

    constructor(private server:any, wsUrl:string) {
        var watcher = new w.SaneWatcher();
        // start watching files
        watcher.watchFiles({
            glob: ['**/*.ts', '**/*.css', '**/*.html', '**/_definition.json'],
            dir: 'app'
        }, this.fileChanged.bind(this));

        // start web sockets:
        this.ws = new ws.Server({
            path: wsUrl,
            server: server
        });
    }

    addHandler(handler:IJDebugFileHandler) {
        this.handlers.push(handler);
    }

    broadcast(command:IJDebugCommand, useDebounce:boolean = false) {
        var payload = JSON.stringify(command);
        var send = () => {
            this.ws.clients.forEach(client => client.send(payload));
            this.defers[payload] = null;
        };

        if (this.defers[payload]) {
            clearTimeout(this.defers[payload]);
        }

        if (useDebounce) {
            this.defers[payload] = setTimeout(()=> send(), this.flushPeriod);
        }
        else {
            send();
        }

    }

    private fileChanged(e:w.IWatchEvent) {
        for (var i = 0; i < this.handlers.length; i++) {
            var handler = this.handlers[i];
            if (handler.fileChanged(e.file)) {
                break;
            }
        }
    }

}