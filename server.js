import {v4 as uuidv4} from 'uuid'

import http from 'node:http'
import {responseJSON, readDataFile, readReqBody, writeFileData, validationReqBody, jsonData} from './components/functions.mjs'

const PORT = 3333 || 8080
const usersData = 'users-data.json'

const server = http.createServer((req, res) => {
    const {method, url} = req
    
    if (method === "POST" && url === "/usuarios") {
        //Cadastro de usuário
        readReqBody(req, (body) => {
            let newUser = JSON.parse(body);
            const allowedFields = ["username", "email", "password", "profile"];
            const requiredFields = ["username", "email", "password"];
            validationReqBody(res, allowedFields, requiredFields, newUser);
            readDataFile(usersData, () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (jsonData.some(user => user.email === newUser.email)) {
                    return responseJSON(res, 400, { message: "Erro: email já cadastrado no banco de dados" });
                } else if (!emailRegex.test(newUser.email)) {
                    return responseJSON(res, 400, { message: "Erro: formato de email inválido" });
                }

                newUser.id = uuidv4();
                newUser.registerDate = new Date();

                jsonData.push(newUser);
                writeFileData(usersData, jsonData, () => {
                    responseJSON(res, 200, newUser);
                });
            });
        });
    }else if (method === "POST" && url === "/login") {
        //Login do usuário
        readReqBody(req, (body) => {
            let userLogin = JSON.parse(body);
            const allowedFields = ["email", "password"];
            const requiredFields = allowedFields;
            validationReqBody(res, allowedFields, requiredFields, userLogin);
            readDataFile(usersData, () => {
                const foundUser = jsonData.find(user => user.email === userLogin.email && user.password === userLogin.password);
                if (foundUser) {
                    responseJSON(res, 200, { message: "Login bem sucedido", user: foundUser });
                } else {
                    responseJSON(res, 401, { message: "Credenciais inválidas" });
                }
            });
        });
    }else if (method === "GET" && url.startsWith("/perfil/")) {
        //Pesquisar usuário
        const userId = url.split('/')[2];
        
        readDataFile(usersData, () => {
            const foundUser = jsonData.find(user => user.id === userId);
            if (foundUser) {
                responseJSON(res, 200, { user: foundUser });
            } else {
                responseJSON(res, 404, { message: "Usuário não encontrado" });
            }
    });
    }else if (method === "PUT" && url.startsWith("/perfil/")) {
        const userId = url.split('/')[2];
        readReqBody(req, (body) => {
            let updateUser = JSON.parse(body);
            const allowedFields = ["name", "bio", "picture"];
            const requiredFields = [];
    
            // Aplica a validação do corpo da requisição
            updateUser = validationReqBody(res, allowedFields, requiredFields, updateUser);
    
            if (updateUser ) {
                // Se a validação falhar, a função validationReqBody irá enviar a resposta de erro
                return;
            }
    
            readDataFile(usersData, () => {
                const foundUser = jsonData.find(user => user.id === userId);
                if (!foundUser) {
                    responseJSON(res, 404, { message: "Usuário não encontrado" });
                    return;
                }
    
                // Atualiza o perfil do usuário com as informações fornecidas
                foundUser.profile = {
                    ...foundUser.profile,
                    ...updateUser
                };
    
                writeFileData(usersData, jsonData, () => {
                    responseJSON(res, 200, { message: "Perfil atualizado com sucesso", user: foundUser });
                });
            });
        });
    }else if(method==="POST" && url.startsWith("/perfil/imagem/")){
        readReqBody(req, (body) => {
        })
    }else if(method==="GET" && url==="/usuarios"){
        readDataFile(usersData, () => {
            responseJSON(res, 200, jsonData)
        })
    }else{
        responseJSON(res, 404, {message: 'Essa rota não existe'})
    }
})

server.listen(PORT, () => {
    console.log('Servidor rodando em: http://localhost:' + PORT)
})