const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdir(dir, function(err, list) {
        if (err) return callback(err);
        let pending = list.length;
        if (!pending) return callback(null, []);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        if (!--pending) callback(null);
                    });
                } else {
                    if (file.endsWith('.jsx') || file.endsWith('.js')) {
                        let content = fs.readFileSync(file, 'utf8');
                        let newContent = content.replace(/material-symbols-outlined(?! notranslate)/g, 'material-symbols-outlined notranslate');
                        if (content !== newContent) {
                            fs.writeFileSync(file, newContent, 'utf8');
                        }
                    }
                    if (!--pending) callback(null);
                }
            });
        });
    });
}

walk(path.join(__dirname, 'src'), (err) => {
    if(err) console.error(err);
    else console.log('Done replacing');
});
