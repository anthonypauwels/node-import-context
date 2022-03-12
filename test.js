import nodeImportContext from "./index.js";

( async () => {
    /** import all js files from ./config directory */
    const context = await nodeImportContext( './config', true, /\.js$/ );

    context.keys().forEach( module_id => {
        context( module_id )
    } );
} )();