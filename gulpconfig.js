var gulpconfig = {
    "path": {
        "root": __dirname,
        "npm": __dirname + "/node_modules",
        "bower": __dirname + "/bower_components"
    },
    "dir": {
        "src": "/src",
        "dev": "/dev",
        "test": "/test",
        "dist": "/dist",
        "client": "/client",
        "server": "/server",
        "shared": "/shared"
    },
    "webpack": {
        "module": {
            "loaders": [
                {"loader": "babel-loader", "test": /\.js$/, "exclude": /node_modules/},
                {"loader": "raw-loader", "test": /\.html$/}
            ]
        },
        "stats": {
            "version": false,
            "modules": true,
            "children": false
        },
        "resolve": {
            "alias": {
                "angularRoute": "angular-route",
                "es6Promise": "es6-promise",
                "injector": __dirname + "/src/shared/components/injector/injector.js"
            }
        }
    },
    "nodepack": {
        "module": {
            "loaders": [
                {"loader": "babel-loader", "test": /\.js$/, "exclude": /node_modules/}
            ]
        },
        "stats": {
            "version": false,
            "modules": true,
            "children": false
        },
        "resolve": {
            "alias": {
                "injector": __dirname + "/src/shared/components/injector/injector.js"
            }
        },
        "externals": {
            "chai": "commonjs chai",
            "es6Promise": "commonjs es6-promise",
            "express": "commonjs express",
            "request": "commonjs request",
            "lodash": "commonjs lodash",
            "morgan": "commonjs morgan",
            "url": "commonjs url"
        },
        "node": {
            "__filename": true,
            "__dirname": true
        }
    },
    "eslint": {},
    "mocha": {}
};

module.exports = gulpconfig;
