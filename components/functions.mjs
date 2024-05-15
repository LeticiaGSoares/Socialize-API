import fs from 'node:fs'
export let jsonData =[]
export const responseJSON = (res, status, message) => { 
    res.writeHead(status, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(message))
}
export const readDataFile = (fileName, callback) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if(err){
            responseJSON(res, 500, {message: "Erro ao buscar dados de usuários"})
        }

        try{
            jsonData = JSON.parse(data)
            callback(jsonData)
        }catch (error){
            console.error('Erro ao ler o arquivo jsonData: ' + error)
            return callback(error)
        }
    })
}
export const readReqBody = (req, callback) => {
    let body = ''

    req.on('data', (chunk) => {
        body+= chunk.toString()
    })
    req.on('end', () => {
        callback(body)
    })
}
export const writeFileData = (fileName, newData, callback) => {
    fs.writeFile(
        fileName,
        JSON.stringify(newData, null, 2),
        (err) => {
            if(err){
                responseJSON(res, 500, {message: 'Erro interno do servidor'})
            }

            callback()
        }
    )
}
export const validationReqBody = (res, allowedFields, requiredFields, value) => {
    const filteredValue = {};

    Object.keys(value).forEach(key => {
        if (allowedFields.includes(key)) {
            filteredValue[key] = value[key];
        }
    });

    if (requiredFields.some(field => !filteredValue[field])) {
        responseJSON(res, 400, { message: "Erro: um dos campos obrigatórios está vazio" });
        return null;
    }

    return filteredValue;
};