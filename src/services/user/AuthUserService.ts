import prismaClient from "../../prisma";
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

interface AuthUserRequest{
    email: string;
    password: string;
}

class AuthUserService{
    async execute({email, password}: AuthUserRequest ) {

        const user = await prismaClient.user.findFirst({
            where:{
                email: email
            },
            include:{
                subscriptions: true,
            }
        })

        if(!user){
            throw new Error("Email/password incorreta")
        }

        const passwordMatch = await compare(password, user?.password)

        if(!passwordMatch){
            throw new Error("Email/Password incorreto")
        }

        // Gerar um Token JWT
        const token = sign(
            {
                name: user.name,
                email: user.email,
            },
            'a593b5ffcbd2f783d02c634cbb39506e',
            {
                subject: user.id,
                expiresIn: '30d'         
            }
        )

        // Verificar se a senha está correta

        return { 
            id: user?.id,
            name: user?.name,
            email: user?.email,
            endereco: user?.endereco,
            token: token,
            subscriptions: user.subscriptions ? {
                id: user?.subscriptions?.id,
                status: user?.subscriptions.status
            } : null
        }
    }
}

export { AuthUserService }