import path from 'path';
import fs from 'fs';

const isRegExp = regExp => {
    return Object.prototype.toString.call( regExp ) === '[object RegExp]';
}

const isString = str => {
    return typeof str === 'string';
}

const findDirectory = directory => {
    if ( path.isAbsolute( directory ) ) {
        return directory;
    }

    return path.normalize( path.join( path.resolve(), directory ) );
}

const nodeImportContext = async (directory = '.', use_subdirectories = false, regExp = /(?:)/) => {
    if ( !isString( directory ) ) {
        throw new Error('Argument [directory] must be String');
    }

    if ( !isRegExp( regExp ) ) {
        throw new Error('Argument [regExp] must be RegExp');
    }

    let files = [];

    directory = findDirectory( directory );

    use_subdirectories = !!use_subdirectories;

    const findModules = directory => {
        if ( fs.existsSync( directory ) ) {
            fs.readdirSync( directory ).forEach( file => {
                const module_id = path.resolve( directory, file );

                if ( fs.statSync( module_id ).isDirectory() ) {
                    if ( use_subdirectories ) {
                        findModules( module_id );
                        return;
                    }
                }

                if ( regExp && !regExp.test( module_id ) ) {
                    return;
                }

                files.push( module_id );
            } );
        } else {
            throw new Error(`Cannot found module ${directory}`);
        }
    }

    findModules( directory );

    const modules = await Promise.all( files.map( async file => {
        return await import( file );
    } ) );

    const context = function( item, index )
    {
        return modules[ index ];
    };

    context.keys = () => [ ...files ];

    return context;
}

export default nodeImportContext;