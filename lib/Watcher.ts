import sane = require('sane');
import path = require('path');

/**
 * Options for watching files
 */
export interface IWatchOptions {
    /**
     * File wildcards to watch
     */
    glob: string[];

    dir: string;
}

/**
 * Information of file change
 */
export interface IChangedFileInfo {
    filepath: string;
}

export enum WatchEventType{
    CHANGED = 1,
    ADDED = 2,
    REMOVED = 3,
    ERROR = 4
}

export interface IWatchEvent{
    type:WatchEventType;
    file: IChangedFileInfo;
}

export interface IWatcher {
    watchFiles(options: IWatchOptions, cb: (info: IWatchEvent) => void);
}

export class SaneWatcher implements IWatcher {

    watchFiles(options: IWatchOptions, cb: (info: IWatchEvent) => void){
        var watcher = new sane(options.dir, {
            glob: options.glob
        });
        watcher.on('change', (filepath, root, stat)=>{
            cb({
                type: WatchEventType.CHANGED,
                file: {
                    filepath: path.join(options.dir, filepath)
                }
            });
        });
    }

}