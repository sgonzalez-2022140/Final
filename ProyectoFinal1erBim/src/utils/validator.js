//Validar diferentes datos.
'use strict'

import { hash, compare } from 'bcrypt'

//Encriptar la contraseña
export const encrypt = (password)=>{
    try{
        return hash(password, 10)
    }catch(err){
        console.error(err)
        return err
    }
}

//Validar la contraseña
export const checkPassword = async(password, hash)=>{
    try{
        return await compare(password, hash)
    }catch(err){
        console.error(err);
        return err
    }
}

export const checkUpdateProduct = (data, productId)=>{
    if(productId){
        if(
            //aqui decimos que si los objetos estan vacios (name y stock) sera falso
            Object.entries(data).length === 0 ||
            data.name ||
            data.name == '' ||
            data.stock ||
            data.stock === ''        
        ) {
            return false
        }
        return true
    }else{
        //aqui decimos que la categoria no puede estar vacia 
        if(
            Object.entries(data).length === 0 ||
            data.category ||
            data.category == ''
        ) {
            return false
        }
        return true
    }
}

export const checkUpdateCategory = (data, CategoryId)=>{
    if(CategoryId){
        if(
            //aqui decimos que si los objetos estan vacios (name y stock) sera falso
            Object.entries(data).length === 0 ||
            data.name ||
            data.name == '' ||
            data.description ||
            data.description == ''        
        ) {
            return false
        }
        return true
    }
}

export const checkUpdate = async(data, userId)=>{
    if(userId){
        if(
            Object.entries(data).length === 0 ||
            data.password ||
            data.password == '' ||
            data.role ||
            data.role == ''
            ) {
                return false
            }
            return true
        }
    }


    export const checkPurchase = async(data, userId)=>{
        if(userId){
            if(
                Object.entries(data).length === 0 ||
                data.user ||
                data.user == '' ||
                data.amount ||
                data.amount == ''
                ) {
                    return false
                }
                return true
            }
        }
    
