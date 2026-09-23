import {useState, useRef,useEffect} from 'react'
import {useNavigate,useParams} from "react-router-dom";
import {useMutation, useQuery} from "@tanstack/react-query";
import boardClient from "../../board-commons";
import {Axios, AxiosError, AxiosResponse} from "axios";
/*
     1. React
        => 상태 (state)에 따라서 UI를 선언적으로 표현하는 컴포넌트 기반의 라이브러리
           => useState => 값이 변경시에 화면 변경
           1) 컴포넌트 기방 UI
           2) 가상돔 (임시 메모리) 사용 = 속도가 빠르다
              메모리(가상) ======  실제메모리
                          diff => 비교 (변경된 부분에 반영)
           3) 데이터 변경이 자동 렌더링
     2. 변수 : props / state
                      | useState : 반드시 => setXxx => HTML 변환
              | <App name="aaa">   : 데이터 변경이 안된다
     3. TanStack-Query
        = 서버 상태 / 클라이언트 상태  => isLoading / isError
        = 서버의 데이터 전송상태 관리
        = 캐싱 / 자동 refetch => 저장 => 같은 키가 있는 경우에는 서버 연결하지 않는다
        = staleTime / cacheTime
          | 메모리에 남아 있는 시간 => 시간이 지나면 자동 삭제
          | 새로운 데이터가 저장되기 전에는 재요청을 하지 않는다
        = React에서 가장 많이 사용
        = NextJS에서 수정없이 바로 사용이 가능
          | Vue / Jquery / React => 호환
        =  useQuery / useMutation
                      | 데이터 변경 (UPDATE , DELETE , INSERT)
           | 데이터 읽기 (SELECT)
     4. 현재 개발
        MSA => 서버 분산 => 화면 통일
          NodeJS    SpringBoot  Python
            |          |          |
            -----------------------
                      | => JSON Raect / Vue  => Server / Client
                    사용자 화면                     |        |
                                                Back      Front
     5. docker-compose / 쿠바네티스 : CI / CD

 */
interface BoardItem{
    NO:number;
    NAME:string;
    SUBJECT:string;
    CONTENT:string;
}
interface BoardResponse{
    msg:string;
}
function BoardUpdate(){
    const nav=useNavigate();
    /*
          name : 현재 값
          setName() : 값 변경하는 역할
            | = useQuery => 서버 / Cache
            | = 재렌더링
     */
    const [name,setName]=useState<string>("");
    const [subject,setSubject]=useState<string>("");
    const [content,setContent]=useState<string>("");
    const [pwd,setPwd]=useState<string>("");
    // => 데이터값 저장 (입력된 값) => 변수
    const nameRef=useRef<HTMLInputElement>(null)
    const subjectRef=useRef<HTMLInputElement>(null)
    const contentRef=useRef<HTMLTextAreaElement>(null)
    const pwdRef=useRef<HTMLInputElement>(null)

    const {no}=useParams();

    const  {isLoading,isError,error,data}=useQuery<{data:BoardItem}>({
        queryKey:['board-update',no],
        queryFn: async()=>{
            return await boardClient.get<BoardItem>(`/board/update_node?no=${no}`);
        }
    })
    const board=data?.data
    console.log(data)
    useEffect(()=>{
        if(board){
            setName(board.NAME)
            setSubject(board.SUBJECT)
            setContent(board.CONTENT)
        }
    },[board])
    // 값을 채운다
    // => 태그를 제어
    const {mutate:boardUpdate}=useMutation({
        mutationFn: async ()=>{
            return await boardClient.put('/board/update_ok_node',{
                no:no,
                name:name,
                subject:subject,
                content:content,
                pwd:pwd
            })
        },
        onSuccess:(res:AxiosResponse<BoardResponse>)=>{
            if(res.data.msg==='yes')
            {
                window.location.href=`/board/detail/${no}`
            }
            else
            {
                alert("비밀번호가 틀립니다!!")
                setPwd("")
                pwdRef.current?.focus()
            }
        },
        onError:(err:Error)=>{
            console.log("Error발생:",err.message)
        }
    })
    // 이벤트 처리
    const update=()=>{
        if(!name.trim())
            return nameRef.current?.focus()
        if(!subject.trim())
            return subjectRef.current?.focus()
        if(!content.trim())
            return contentRef.current?.focus()
        if(!pwd.trim())
            return pwdRef.current?.focus()
        boardUpdate()

    }

    return (
        <main className="restaurant-page board-page">

            {/* 페이지 제목 */}
            <section className="page-title">

                <span>
                    COMMUNITY
                </span>

                <h1>
                    수정하기
                </h1>

                <p>
                    맛집에 대한 이야기를 자유롭게 작성해주세요.
                </p>

            </section>


            {/* 글쓰기 폼 */}
            <section className="board-form">
                <div className="form-group">

                    <label>
                        작성자
                    </label>

                    <input
                        type="text"
                        placeholder="작성자를 입력해주세요."
                        value={name}
                        ref={nameRef}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                </div>
                <div className="form-group">

                    <label>
                        제목
                    </label>

                    <input
                        type="text"
                        placeholder="제목을 입력해주세요."
                        value={subject}
                        ref={subjectRef}
                        onChange={(e) =>
                            setSubject(e.target.value)
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        내용
                    </label>

                    <textarea
                        placeholder="내용을 입력해주세요."
                        value={content}
                        ref={contentRef}
                        onChange={(e) =>
                            setContent(e.target.value)
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        비밀번호
                    </label>

                    <input
                        type="password"
                        placeholder="비밀번호를 입력해주세요."
                        ref={pwdRef}
                        value={pwd}
                        onChange={(e) =>
                            setPwd(e.target.value)
                        }
                    />

                </div>
                <div className="board-form-buttons">

                    <button
                        className="form-submit-btn"
                        onClick={()=>update()}
                    >
                        등록하기
                    </button>
                    <button
                        className="form-cancel-btn"
                        onClick={() => nav(-1)}
                    >
                        취소
                    </button>



                </div>

            </section>

        </main>

    )
}
export default BoardUpdate;