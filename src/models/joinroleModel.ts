import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinRole extends Document {
  Guild: string;
  RoleID: string;
  RoleName: string;
}

const joinRoleSchema: Schema<IJoinRole> = new Schema({
  Guild: {
    type: String,
  },
  RoleID: {
    type: String,
  },
  RoleName: {
    type: String,
  },
});

export default mongoose.model<IJoinRole>('JoinRole', joinRoleSchema);
