import { Router } from 'express'
import express from 'express'
import {Task, User} from '../models/db.mjs'
import cors from 'cors';
import { io } from '../app.mjs';



const router = new Router();
router.use(express.json());
router.use(cors());

router.get('/tasks', async (req, res)=>{
    const data = await Task.find({user: req.user._id});
    res.json(data);
})

router.post('/tasks/add', async(req, res)=>{
    console.log(req.user);
    const {name, deadline} = req.body;
    const task = new Task({name:name, deadline:deadline, user:req.user._id});
    try {
        const savedTask = await task.save();
        io.emit('newTask', savedTask);
        res.json({ error: null, data: { name: savedTask.name , deadline: savedTask.deadline } })
    } catch(e) {
        res.json({ error: 'error saving do db', data: null } )
    }
})

router.post('/tasks/remove/selected', async (req, res) => {
    console.log(req.user);
    const { tasks } = req.body;
    try {
        for (const id of tasks) {
            await Task.deleteOne({ "_id": id });
        }
        res.status(200).send({ message: "Tasks successfully removed" });
    } catch (error) {
        console.error("Error removing tasks:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

export default router;