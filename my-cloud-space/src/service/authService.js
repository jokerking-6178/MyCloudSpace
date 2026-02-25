import axios from 'axios'

const API_URL = "http://localhost:8081/api/user"

export const registerUser = async (data) => {
    try{
        const response = await axios.post(API_URL +"/register", data)
        return response;
    }catch(error){
        throw error
    }
}

export const login = async (data) => {
    try {
        const response = await axios.post(API_URL +"/login", data)
        return response
    } catch (error) {   
        throw error
    }
}

export const fetchUserData = async (email , token) => {
    try{
        const response = await axios.get(API_URL +"/email/"+email , {headers : {Authorization : `Bearer ${token}`}})
        return response
    }catch(error){
        console.error("error finding user")
    }
}