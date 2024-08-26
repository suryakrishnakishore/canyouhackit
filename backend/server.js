import express, { response } from "express";
import env from "dotenv";
import cors from "cors";
import Pg from "pg";
import BodyParser from "body-parser";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";

const app = express();
env.config(); 

app.use(cors());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.json());

const db = new Pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();
// Get all todos...
const saltRounds=10;
app.get("/todos/:userEmail", async (req, res) => {
    console.log(req);
    const { userEmail } = req.params;
    try {
        const todos = await db.query(`SELECT * FROM todos WHERE user_email=$1`, [userEmail]);
        res.status(200).send(todos.rows);
    } catch (err) {
        console.log(err);
    }
});

// Make new todos...
app.post("/todos", async (req, res) => {
    console.log(req);
    const { user_email, title, body, date} = req.body;
    const id = uuidv4();
    try {
        const responce = await db.query(`INSERT INTO todos VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
            id,
            user_email,
            title,
            body,
            date,
        ]);
        console.log(responce);
    } catch (err) {
        console.log(err);
    }
});

// Editing a todo...
app.put("/todos/:user_id", async (req, res) => {
    console.log("This is the Body of req ; ", req.body);
    console.log("This is the paramenter: ", req.params);
    const { user_id } = req.params;
    console.log(user_id);
    const { user_email, title, body, date} = req.body;
    const id = uuidv4();
    try {
        const responce = await db.query(`UPDATE todos SET title = $1, body =  $2 WHERE id = $3 RETURNING *`, [
            
            title,
            body,
            user_id,
        ]);
        console.log(responce);
    } catch (err) {
        console.log(err);
    }
});

// Delete a todo...
app.delete("/todos/:user_id", async (req, res) => {
    const {user_id} = req.params;
    try {
        const response = await db.query(`DELETE FROM todos WHERE id = $1`, [user_id]);

    } catch (err) {
        console.log(err);
    }
});

// SignUp a USER...
app.post("/signup", async (req, res) => {
    console.log(req.body);
    const { user_email, password } = req.body;

    try {

        const response = await db.query(`SELECT * FROM users WHERE email=$1`, [
            user_email, 
            
        ]);
        if(response.rows.length===0)
        {
            bcrypt.hash(password,saltRounds,async(err,hash)=>
        {
            try
            {
            const result= await db.query(`INSERT INTO users (email,hashed_pass) VALUES ($1,$2) RETURNING  *`,[user_email,hash]);
            res.send({
                status: true,
            });
            console.log(res);
            } catch(err)
            {
                console.log(err);
            }
            
        })
        }
        else
        {
            res.send({
                status: false,
            });
        }
    } catch (err) {
        console.log(err);
    }
});

// LogIn a USER...
app.post("/login", async (req, res) => {
    console.log(req.body);
    const {user_email, password} = req.body;
    try {
        const responce = await db.query(`SELECT (hashed_pass) FROM users WHERE email = $1`, [user_email]);
        console.log(responce.rows[0].hashed_pass);
        if(responce.rows.length!==0)
        {
            const details=responce.rows[0];
            const storedPass =details.hashed_pass;
            bcrypt.compare(password,storedPass,(err,result)=>
        {
            
            try {
            console.log("the reult is all ", result);
            } 
            catch (err)
            {console.log(err);}

            if(result===true)
            {
                res.status(200).send({
                    status: true,
                })
            }
            else
            {
                res.status(403).send({
                    status: false,
                })
            }
            
        })

        }
        else
        {
            res.send("User Doesnt Exist");
        }
      /*  if(password === responce.rows[0].hashed_pass){
            res.status(200).send({
                status: true,
            })
        } else {
            res.status(403).send({
                status: false,
            })
        }*/
    } catch (err) {
        console.log(err);
    }
})

//get page details
app.get("/todos/:userEmail/:ind",async(req,res)=>
{
    console.log(req);
    const {userEmail,ind} = req.params;
    try {
        const todos = await db.query(`SELECT * FROM todos WHERE user_email=$1 AND id= $2`, [userEmail, ind]);
        console.log(todos.rows[0]);
        res.status(200).send(todos.rows[0]);
    } catch (err) {
        console.log(err);
    }
})

app.listen(process.env.R_PORT, ()=> {
    console.log(`Server is running on port ${process.env.R_PORT}...`);
});