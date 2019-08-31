

class Defaults {
    static getDefaultSettings() {
        // default settings
        return {
            extension: {
                websocket: {
                    subProtocol: 'SubstratumNode-UI',
                    protocol: 'ws',
                    host: '127.0.0.1', // 127.0.0.1 is the only manifest permissioned and assumed
                    port: 5333 // SubstratumNode default websocket port
                }
            },
            proxy: {
                http: {
                    active: true, // setting to include proxy type in toggle
                    protocol: 'http',
                    host: '127.0.0.1',
                    port: 80
                },
                ssl: {
                    active: true,
                    protocol: 'https',
                    host: '127.0.0.1',
                    port: 443
                }
            }
        }        
    }
}

export { Defaults as default }