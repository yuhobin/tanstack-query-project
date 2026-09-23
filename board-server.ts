// nodejs 가장 간단한 서버
import express from "express";
// CrossOrigin => port가 다른 경우 허용
import cors from "cors";
import oracledb from "oracledb";
// 요청값을 받는다
import request from "request"; // 외부 HTTP 요청 모듈 => 유튜브 검색

const app=express(); // 서버 객체 생성
// port 허용 => 설정
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH" ]
}));
app.use(express.json()); // JSON 형태로 POST 데이터를 받게 설정
// 서버 가동 => 대기 상태 => 0~65535 => 0~1023 이미 사용중 port
app.listen(3355,()=>{
    console.log("Server started on port 3355", "http://localhost:3355");
})
/*
    React / TanStackQuery
            |
        Node Express
            |
          Oracle
 */
// 오라클 설정 => SELECT 결과를 객체 형식으로 받는다
oracledb.outFormat=oracledb.OUT_FORMAT_OBJECT

// 오라클 연결 => user/pwd/url xe (전역 데이터베이스) => 실무에선 ora / orcl
async function getConnection(){
    return await oracledb.getConnection({
        user:'hr',
        password:'happy',
        connectionString:'127.0.0.1/xe'
    })
}
/*
    @GetMapping("/board/list_node")
    public String board_list(HttpServletRequest req, HttpServletResponse res) {
        String page=request.getParameter("page");
        if(page==null)
        page="1"
    }
 */
// .board/list_node?page=1  /board/list_node/1
// 모든 웹서버는 자동으로 request, response를 지원
app.get("/board/list_node/", async (req, res) => {
    let conn;
    // page==null page="1"
    const page = parseInt(req.query.page as string) || 1

    const rowSize=10
    const start=(page-1)*rowSize;

    try {
        conn=await getConnection();
        const listsql=`
                   SELECT no, subject, name, TO_CHAR(regdate, 'YYYY-MM-DD') as dbday, hit
                   FROM jspboard
                   ORDER BY no DESC
                   OFFSET ${start} ROWS FETCH NEXT 10 ROWS ONLY
                   `
        const totalsql=`
                        SELECT CEIL(COUNT(*)/10.0) as totalpage
                        FROM jspboard    
                         `
        const result=await conn.execute(listsql)
        // 오라클 => SQL 문장 실행 요청
        const total=await conn.execute(totalsql)
        // [ {TOTALPAGE: 5} ]
        // rows: [{no:1...},{no:2...},{no:3...}]
        const totalpage=(total.rows as {TOTALPAGE:number}[])[0].TOTALPAGE
        console.log(result.rows)
        console.log(total.rows)
        console.log(totalpage)
        res.json({
            curpage:page,
            totalpage,
            list: result.rows
        })
    }catch (error) {
        console.log(error); // 오류 처리
    }
    finally {
        // conn 값이 있는 경우 true / null => false
        if(conn) {
            await conn.close() // 무조건 수행하는 문장
        }
    }
});
// insert
app.post("/board/insert_node", async (req, res) => {
    let conn
    const {name, subject, content, pwd} = req.body;
    try {
        conn = await getConnection();
        const sql = `INSERT INTO jspboard(name, subject, content, pwd) VALUES (:name, :subject, :content, :pwd)`
        await conn.execute(
            sql,
            {name, subject, content, pwd},
            {autoCommit:true} // 자바는 autocommit => commit
            )
        res.json({msg:"yes"}) // 성공 시에는 React에 전송
    }catch (error) {
        console.error(error);
        res.status(500).json({msg:'no'}) // 실패 시에는 에러 출력
    }
    finally {
        if(conn) {
            await conn.close()
        }
    }
})

// detail => nodeJS / springBoot / python

