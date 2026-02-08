var app = Application('Reminders');
var lists = app.lists();
var output = [];

for (var i = 0; i < lists.length; i++) {
    output.push({
        id: lists[i].id(),
        title: lists[i].name()
    });
}

JSON.stringify(output);
