var path = require('path');

module.exports = {
    // Change to your "entry-point".
    entry: './src/app',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },
    devServer: {
        contentBase: path.join(__dirname),
        compress: true,
        port: 9001
      }
};