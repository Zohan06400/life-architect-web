var app = Application('Reminders');
var output = [];

// Get reminders from default list (or loop through all lists)
var lists = app.lists();

for (var i = 0; i < lists.length; i++) {
    var list = lists[i];
    var reminders = list.reminders.whose({completed: false})();
    
    for (var j = 0; j < reminders.length; j++) {
        var rem = reminders[j];
        var dueDate = rem.dueDate();
        
        output.push({
            id: rem.id(),
            name: rem.name(),
            list: list.name(),
            dueDate: dueDate ? dueDate.toISOString() : null,
            priority: rem.priority(),
            notes: rem.body()
        });
    }
}

JSON.stringify(output);
