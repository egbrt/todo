const back = require('androidjs').back;
const fs = require('fs');
const path = require('path');


back.on('readToDo', function(filepath){
	let file = path.join(filepath, 'todo.txt');
	fs.readFile(file, 'utf-8', function(err, data) {
		if (err) {
			let message = "<p>Trying to read: " + file + "</p>";
			if (err.code == "EACCES") {
				message += "<p>Please go to <em>Settings</em> and set <em>Allow management of all files</em> for this app.</p>";
			}
			back.send('readError', message);
		}
		else { 
			back.send('readDone', data);
		}
	})
})

back.on('writeToDo', function(filepath, data){
	let file = path.join(filepath, 'todo.txt');
	fs.writeFile(file, data, function(err) {
		if (err) back.send("writeError", file);
	})
})
