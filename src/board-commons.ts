import axios, {AxiosInstance} from "axios"
// NodeJS => 임의로 포트는 설정
const boardClient = axios.create({
    baseURL: "http://localhost:3355",
    headers: {
        "Content-Type": "application/json",
    }
})
export default boardClient