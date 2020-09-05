import { Resolver, Query, Mutation, InputType, Field, Arg, Ctx, ObjectType } from 'type-graphql'
import { MyContext } from '../types'
import { User } from '../enteties/User'
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(()=> [FieldError], {nullable:true})
    errors?: FieldError[]

    @Field(()=> User, {nullable:true})
    user?: User
}

@Resolver()
export class UserResolver{
    @Mutation(() => UserResponse)   
    async register(
        @Arg('input') input: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ):Promise<UserResponse> {
        if (input.username.length <= 3 ) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username legth must be greate than 3'
                }]
            }          
        }
        if (input.password.length <= 5 ) {
            return {
                errors: [{
                    field: 'password',
                    message: 'username legth must be greate than 5'
                }]
            }          
        }

        const hashPassowrd = await argon2.hash(input.password)
        const user = em.create(User, {username: input.username, password: hashPassowrd})

        try {
            await em.persistAndFlush(user)            
        } catch (error) {
            if (error.detail.includes('already exists') || error.code === '23505'){
                return {
                    errors: [{
                        field: 'username',
                        message: 'username already exist'
                    }]
                }
            }
        }
        return {user}
    }

    @Mutation(() => UserResponse)   
    async login(
        @Arg('input') input: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ):Promise<UserResponse> {
        const user = await em.findOne(User, {username: input.username})
        if (!user){
            return {
                errors: [{
                    field: 'username',
                    message: 'could not found username'
                }]
            }
        }
        const valid = await argon2.verify(user.password, input.password)
        if (!valid){
            return {
                errors: [{
                    field: 'password',
                    message: 'invalid password'
                }]
            }
        }

        return {user}
    }
}