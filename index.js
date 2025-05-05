const express = require('express'); 
const users = require('./MOCK_DATA.json');
const fs = require('fs');

//passport js and wisten for logging jwt token authentication

const app = express();
const PORT = 8000;

//Routes

app.use(express.urlencoded({extended:false}))

app.get("/users",(req,res)=>{
    return res.json(users);
}
);

app.use((req,res,next)=>{
    fs.appendFile('log.txt', ` ${Date.now()} Request URL: ${req.url}, Request Method: ${req.method}\n`, (err,data) => {
        if (err) throw err;
        next();
    });
})


app.get("/users/:id",(req,res)=>{
    const {id} = Number(req.params.id);
    const user = users.find((user)=> user.id === id);
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    return res.json(user);
})

app.listen(PORT,()=>{console.log(`Server is running on port http://localhost:${PORT}`)});