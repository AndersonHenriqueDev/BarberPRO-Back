import prismaClient from "../../prisma";

interface HaircutRequest{
    user_id: string;
    name: string;
    price: number;
}

// Verificar quantos modelos esse usuario já tem cadastrado
// Verificar se ele é premium, senao limitamos a quantidade de modelos para cadastrar

class CreateHaircutService{
    async execute({user_id, name, price}: HaircutRequest ){
        if(!name || !price){
            throw new Error("Erro")
        }

        // Verificar quantos modelos esse usuario já tem cadastrado
        const myHaircuts = await prismaClient.haircut.count({
            where:{
                user_id: user_id
            }
        })

        const user = await prismaClient.user.findFirst({
            where:{
                id: user_id,
            },
            include:{
                subscriptions: true,
            }
        })

        // Posso criar a validação ou limite
        if(myHaircuts >= 3 && user?.subscriptions?.status !== 'active'){
            throw new Error("Não autorizado(a)!")
        }

        const haircut = await prismaClient.haircut.create({
            data:{
                name: name,
                price: price,
                user_id: user_id,
            }
        })

        return haircut;

    }
}

export { CreateHaircutService };