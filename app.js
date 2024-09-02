import express from "express";
import connect from "./schemas/index.js";
import todosRouter from "./routes/todos.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";
const app = express();
const PORT = 3000;

connect();
//express 에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정함
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./assets")); //정적인파일(static)을 assets폴더에 있는 파일을 바탕으로 서빙을 할꺼다~ 라는코드

app.use((req, res, next) => {
  console.log("Request URL:", req.originalUrl, "-", new Date());
  next();
});

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hi yo!" });
});

app.use("/api", [router, todosRouter]);

//에러 처리 미들웨어 등록
//router 아래 등록하는이유 : 미들웨어는 등록한 순서대로 실행됨
//TodoRouter 에서 로직을 수행한 후 발생한 에러는 다음 미들웨어로 전달됨
//이때 에러처리 미들웨어가 라우터 이후 등록되어있다면 에러를 잡아 처리함
//이떄문에 항상 에러 처리 미들웨어는 라우터 설정코드 하단에 위치해야함
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트나이트");
  console.log("깃 테스트입니다.");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// app.js

// import express from "express";

// const app = express();
// const PORT = 3000;

// app.use((req, res, next) => {
//   console.log("첫번째 미들웨어");
//   next();
// });

// app.use((req, res, next) => {
//   console.log("두번째 미들웨어");
//   next();
// });

// app.get("/", (req, res, next) => {
//   console.log("GET / 요청이 발생했습니다.");
//   next();
// });

// app.use((req, res, next) => {
//   console.log("세번째 미들웨어");
//   res.json({ message: "Hi" });
// });

// app.use((req, res, next) => {
//   console.log("네번째 미들웨어");
//   res.json({ message: "마지막 미들웨어 입니다." });
// });

// app.listen(PORT, () => {
//   console.log(PORT, "포트로 서버가 열렸어요!");
// });

/*listen을 사용하여 포트를 염 , 
첫번째 미들웨어 실행 next(),
두번째미들웨어 실행 next(),
겟요청발생 next(),
세번째 미들웨어 실행 hi반환 Json res 로 값을 응답해줫기때문에 다음 미들웨어로 넘어가지않음*/
