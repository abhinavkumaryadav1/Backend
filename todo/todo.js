const fs = require("fs");
const path= "./task.json";

const loadTasks = ()=> // to add task first we need to load all the tasks and convert it into JSON
{
    try {   
    const dataBuffer = fs.readFileSync(path)
    const dataJSON = dataBuffer.toString()
    return JSON.parse(dataJSON)
    }
     catch (error) {
        return []
    }
}

const saveTasks = (tasks)=>{

   const dataJSON=  JSON.stringify(tasks)
   fs.writeFileSync(path,dataJSON) 
   
   
}

const addTask =(task)=>{
    const tasks =loadTasks()
    tasks.push({task})
    saveTasks(tasks)
    console.log("task added",task);

}


const listTasks =()=>{
    const tasks =loadTasks()
    tasks.forEach((task,index) => {
        console.log(`${index+1} - ${task.task}`);
        
    });
}

const removeTask= (idx)=>{

let tasks = loadTasks()
tasks= tasks.filter((task,index)=> index !== idx-1)
saveTasks(tasks);
console.log(`removed task at ${idx}.`);


}

const command = process.argv[2]; /*in node js eviornment we can directly access the CLI by using this
                                   returns a array you can study about isTypedArray([1] path [2] command)*/ 
const argument = process.argv[3];

if(command === 'add') {
    addTask(argument);
}
else if(command === 'list') {
    listTasks(argument);
}
else if(command === 'remove') {
    removeTask(parseInt(argument));
}
else {
    console.log("command not found");
    
}
