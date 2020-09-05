import { Post } from "./enteties/Post";
import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { User } from "./enteties/User";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    },
    entities: [Post, User],
    password:'9511',
    dbName: 'guru99',
    debug: true,
    type:'postgresql'
  } as Parameters<typeof MikroORM.init>[0];