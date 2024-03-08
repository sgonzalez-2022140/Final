import User from './user.model.js'

import {    encrypt, 
    checkPassword, checkUpdate 
    
} from '../utils/validator.js'

import { generateJwt } from '../utils/jwt.js'


export const register = async(req, res)=>{
    try{
        //Capturar el formulario (body)
        let data = req.body
        //Encriptar la contraseña
        data.password = await encrypt(data.password)        
        //Guardar la información en la BD
        data.role = 'ADMIN'
        let user = new User(data)
        await user.save() //Guardar en la BD
        //Responder al usuario
        return res.send({message: `Registered successfully, can be logged with username ${user.username}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registering user', err: err})
    }
}

export const registClient = async(req, res)=>{
    try{
        //Capturar el formulario (body)
        let data = req.body
        //Encriptar la contraseña
        data.password = await encrypt(data.password)        
        //Guardar la información en la BD
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save() //Guardar en la BD
        //Responder al usuario
        return res.send({message: `Registered successfully, can be logged with username ${user.username}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registering user', err: err})
    }
}

export const login = async(req, res)=>{
    try{
        let { account , password } = req.body

        // Validar que exista por medio de variable de account
        let user = await User.findOne({
            $or: [
                { username: account },
                { email: account }
            ]
        })
        //Verifico que la contraseña coincida
        if(user && await checkPassword(password, user.password)){
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            //Generar el Token
            let token = await generateJwt(loggedUser)
            //Respondo al usuario
            return res.send(
                {
                    message: `Welcome ${loggedUser.name}`, 
                    loggedUser,
                    token
                }
            )
        }
        return res.status(404).send({message: 'Invalid credentials'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error to login'})
    }
}

export const deleteUser = async(req, res)=>{
    try{
        //Obtener el Id
        let { id } = req.params
                
        let deletedUser = await User.findOneAndDelete({_id: id}) 
        //Verificar que se eliminó
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not deleted'})
        //Responder
        return res.send({message: `Account with username ${deletedUser.username} deleted successfully`}) //status 200
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting account'})
    }
}

export const updateUser = async(req, res)=>{
    try{
        //Obtener el id
        let { id } = req.params
        //traer los datos del body
        let data = req.body
        //validar si trae datos
        let update = checkUpdate(data, id)
        if(!update) return res.status(400).send({message: 'You submitted some data that cannot be updated like password or role'})
        //Actualizar
        let updatedUser = await User.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )
        if(!updatedUser) return res.status(401).send({message: 'User not found and not updated'})
        return res.send({message: 'Updated user', updatedUser})
    }catch(err){
        console.error(err)
    }
}

export const userDefect = async(req, res) =>{
    try{
        const userExists = await User.findOne({username: 'admin'})
        if(userExists){
            console.log('Se creo usuario')
        }else{
            const encryptPassword = await encrypt('Guatemala')
            const newUser = new User({
                name: 'administrador',
                lastName: 'general',
                username: 'administrador',
                password: encryptPassword,
                email: 'eladmin@gmail.com',
                phone: '11225544',
                role: 'ADMIN'

            })
            await newUser.save()
        }
    }catch(err){
        console.error('Admin already exists')
        
    }
}