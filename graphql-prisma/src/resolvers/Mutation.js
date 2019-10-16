import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getUserId from '../utils/getUserId'

const Mutation = {
  // USERS //////////////////////////////////////////////////////////////////////////
  async createUser(parent, args, { prisma }, info){

    if(args.data.password.length < 8) throw new Error("Password must be 8 characters or longer")

    const password = await bcrypt.hash(args.data.password, 10)

    const user = await prisma.mutation.createUser({
       data: {
         ...args.data,
         password
       }
      })

    return {
      user,
      token: jwt.sign({userId: user.id}, 'SuperSecretTempKey')
    }
  },
  async login(parent, args, {prisma}, info){
    const user = await prisma.query.user({
      where:{email:args.data.email}
    })

    if(!user) throw new Error("No user")

    const isMatch = await bcrypt.compare(args.data.password ,user.password);

    if(!isMatch) throw new Error("Unable to login")


    return {
      user,
      token: jwt.sign({userId: user.id}, "SuperSecretTempKey")
    }

  },
  deleteUser(parent, args, { prisma }, info){
    return prisma.mutation.deleteUser({where:{id:args.id}}, info)
  },
  updateUser(parent, args, { prisma }, info){

    return prisma.mutation.updateUser({
      data:args.data,
      where:{id: args.id}
    }, info)
  },

  // POSTS //////////////////////////////////////////////////////////////////////////
  createPost(parent, args, { prisma, request }, info){

    const userId = getUserId(request)

    return prisma.mutation.createPost({
      data: {
        title: args.data.title,
        body: args.data.body,
        published: args.data.published,
        author: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
  },
  deletePost(parent, args, { prisma }, info){
    return prisma.mutation.deletePost({where:{id:args.id}}, info)
  },
  updatePost(parent, args, { prisma }, info){
    return prisma.mutation.updatePost({
      data:args.data,
      where:{id: args.id}
    }, info)

  },

  // COMMENTS //////////////////////////////////////////////////////////////////////////
  createComment(parent, args, { prisma }, info){
    return prisma.mutation.createComment({
      data:{
        text: args.data.text,
        author:{
          connect:{
            id: args.data.author
          }       
        },
        post:{
          connect:{
            id: args.data.post
          }
        }
      }
    }, info)
  },
  deleteComment(parent, args, { prisma }, info){
    return prisma.mutation.deleteComment({where:{id:args.id}}, info)
  },
  updateComment(parent, args, { prisma }, info){
    return prisma.mutation.updateComment({
      where:{id:args.id},
      data:args.data
    }, info)
  }
}

export default Mutation