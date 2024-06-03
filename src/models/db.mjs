import '../config.mjs';
import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
const { Schema } = mongoose;

// Define schema for User
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true }
});

UserSchema.plugin(passportLocalMongoose);

// Define schema for Task
const TaskSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  deadline: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Create models from schemas
const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema);

mongoose.connect(process.env.DSN );
export { User, Task };